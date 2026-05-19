import { Paper, Typography, Box, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFinance } from '../context/FinanceContext';

const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function TransactionList() {
  // Alterado aqui: Pegamos a função assíncrona deleteTransaction em vez do dispatch interno
  const { filtered, deleteTransaction } = useFinance();

  return (
    <Paper elevation={0} sx={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.primary">Histórico de Atividades</Typography>
        <Typography variant="caption" color="text.secondary">{filtered.length} transações encontradas</Typography>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">Nenhum registro encontrado no período atual.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((t) => (
            <Box 
              key={t.id} 
              sx={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 3, 
                py: 2.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                transition: '0.2s',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' },
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight="600" color="text.primary" mb={0.5}>{t.description}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={t.category} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)', color: 'text.secondary', fontSize: 11, fontWeight: 500, height: 22 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="body1" 
                  fontWeight="700"
                  sx={{ color: t.type === 'income' ? '#10B981' : '#EF4444', fontFamily: 'monospace', fontSize: '15px' }}
                >
                  {t.type === 'income' ? '+' : '-'} {fmt(t.amount)}
                </Typography>
                
                {/* Alterado aqui: onClick agora chama a remoção em nuvem do Supabase */}
                <IconButton 
                  onClick={() => deleteTransaction(t.id)}
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.08)' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}