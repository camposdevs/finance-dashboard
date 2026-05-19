import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useFinance } from '../context/FinanceContext';

const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

function Card({ title, value, Icon, gradient, iconColor }) {
  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 4,
        background: gradient,
        border: '1px solid rgba(255, 255, 255, 0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" fontWeight="500" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
          {title}
        </Typography>
        <Box sx={{ color: iconColor, display: 'flex', alpha: 0.8 }}>
          <Icon sx={{ fontSize: 24 }} />
        </Box>
      </Box>
      <Typography variant="h4" fontWeight="700" sx={{ color: '#fff', letterSpacing: '-0.03em' }}>
        {fmt(value)}
      </Typography>
    </Paper>
  );
}

export default function SummaryCards() {
  const { balance, income, expense } = useFinance();
  
  return (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={4}>
        <Card 
          title="Saldo Geral Acumulado" 
          value={balance} 
          Icon={AccountBalanceWalletIcon} 
          gradient="linear-gradient(135deg, #1E1B4B 0%, #111827 100%)" 
          iconColor="#818CF8" 
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card 
          title="Receitas do Mês" 
          value={income} 
          Icon={TrendingUpIcon} 
          gradient="linear-gradient(135deg, #064E3B 0%, #111827 100%)" 
          iconColor="#34D399" 
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card 
          title="Despesas do Mês" 
          value={expense} 
          Icon={TrendingDownIcon} 
          gradient="linear-gradient(135deg, #451A03 0%, #111827 100%)" 
          iconColor="#F87171" 
        />
      </Grid>
    </Grid>
  );
}