import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

const FinanceContext = createContext();

const initialState = {
  transactions: [],
  filter: 'all',
  monthFilter: new Date().toISOString().slice(0, 7),
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_MONTH':
      return { ...state, monthFilter: action.payload };
    case 'CLEAR_DATA':
      return { ...state, transactions: [] };
    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Buscar transações do usuário logado direto no Supabase
  const fetchTransactions = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: data });
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  // Monitora login/logout para carregar ou limpar os dados na tela
  useEffect(() => {
    fetchTransactions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchTransactions();
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_DATA' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Interceptador para Adicionar Transação na Nuvem
  const addTransaction = async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const newTransaction = {
      ...transactionData,
      user_id: user.id, // Vincula a transação ao ID único do usuário logado
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction])
      .select()
      .single();

    if (!error && data) {
      dispatch({ type: 'ADD_TRANSACTION', payload: data });
    }
  };

  // Interceptador para Deletar Transação na Nuvem
  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  // Regras de cálculo visual da interface (Mantidas idênticas e otimizadas)
  const balance = useMemo(() => {
    return state.transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [state.transactions]);

  const filtered = useMemo(() => {
    return state.transactions.filter((transaction) => {
      const inMonth = transaction.date.startsWith(state.monthFilter);
      const inType = state.filter === 'all' || transaction.type === state.filter;
      return inMonth && inType;
    });
  }, [state.transactions, state.monthFilter, state.filter]);

  const monthlyTotals = useMemo(() => {
    const currentMonthTransactions = state.transactions.filter((t) =>
      t.date.startsWith(state.monthFilter)
    );

    const income = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  }, [state.transactions, state.monthFilter]);

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        filtered,
        income: monthlyTotals.income,
        expense: monthlyTotals.expense,
        balance,
        dispatch,
        addTransaction,    // Nova função cloud
        deleteTransaction, // Nova função cloud
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}