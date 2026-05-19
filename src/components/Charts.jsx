import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { useFinance } from '../context/FinanceContext';

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function getLast6Months(transactions) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const month = d.toLocaleDateString('pt-BR', { month: 'short' });
    const slice = transactions.filter((t) => t.date.startsWith(key));
    months.push({
      month: month.charAt(0).toUpperCase() + month.slice(1).replace('.', ''),
      income: slice.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
      expense: slice.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    });
  }
  return months;
}

export default function Charts() {
  const { transactions } = useFinance();

  const byCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const monthlyData = getLast6Months(transactions);
  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 4, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary" mb={3}>Fluxo de Caixa Mensal</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v) => [formatCurrency(v), '']} />
              <Legend verticalAlign="top" height={40} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
              <Area type="monotone" dataKey="income" name="Receitas" stroke="#10B981" fill="url(#colorIncome)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="expense" name="Despesas" stroke="#EF4444" fill="url(#colorExpense)" strokeWidth={2.5} />
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 4, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary" mb={3}>Distribuição de Gastos</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={68} outerRadius={85} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ outline: 'none' }} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v) => formatCurrency(v)} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11, pt: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}