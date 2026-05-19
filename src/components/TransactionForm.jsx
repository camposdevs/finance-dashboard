import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Button, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';
import { useFinance } from '../context/FinanceContext';

const CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Freelance', 'Outros'];

export default function TransactionForm({ open, onClose }) {
  // Alterado aqui: Pegamos a função assíncrona addTransaction do nosso contexto do Supabase
  const { addTransaction } = useFinance();
  const [form, setForm] = useState({
    description: '', amount: '', type: 'expense',
    category: 'Alimentação', date: new Date().toISOString().slice(0, 10),
  });

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.description || !form.amount) return;
    
    // Executa a função que salva na nuvem do Supabase
    await addTransaction({ ...form, amount: Number(form.amount) });
    
    onClose();
    setForm({ description: '', amount: '', type: 'expense', category: 'Alimentação', date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle fontWeight="700">Nova Transação</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={1}>
          <ToggleButtonGroup
            value={form.type} 
            exclusive
            onChange={(_, v) => v && setForm({ ...form, type: v })}
            fullWidth
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', p: 0.5, borderRadius: '12px' }}
          >
            <ToggleButton value="income" sx={{ border: 'none', borderRadius: '8px !important', textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' } }}>Receita</ToggleButton>
            <ToggleButton value="expense" sx={{ border: 'none', borderRadius: '8px !important', textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' } }}>Despesa</ToggleButton>
          </ToggleButtonGroup>
          
          <TextField label="Descrição" fullWidth variant="outlined" value={form.description} onChange={handle('description')} />
          <TextField label="Valor (R$)" type="number" fullWidth variant="outlined" value={form.amount} onChange={handle('amount')} />
          
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select value={form.category} label="Categoria" onChange={handle('category')}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          
          <TextField label="Data" type="date" fullWidth value={form.date} onChange={handle('date')} InputLabelProps={{ shrink: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" disableElevation onClick={handleSubmit} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 3, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}