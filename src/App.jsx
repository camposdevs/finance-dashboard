import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

import { supabase } from './services/supabaseClient';
import { FinanceProvider } from './context/FinanceContext';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Login from './components/Login';

const premiumDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366F1' },
    background: { default: '#0B0F19', paper: '#111827' },
    text: { primary: '#F9FAFB', secondary: '#9CA3AF' },
    divider: 'rgba(255, 255, 255, 0.06)',
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: '"Inter", sans-serif' },
});

export default function App() {
  const [session, setSession] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  // Monitora o estado da sessão de login em tempo real
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Se não estiver logado, exibe a tela de login
  if (!session) {
    return (
      <ThemeProvider theme={premiumDarkTheme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={premiumDarkTheme}>
      <CssBaseline />
      <FinanceProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
          
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, height: 70 }}>
              <Typography variant="h5" sx={{ background: 'linear-gradient(45deg, #F9FAFB, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                Finance Campos
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<AddIcon />}
                  onClick={() => setOpenForm(true)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Nova Transação
                </Button>
                
                {/* Botão de Logout */}
                <IconButton onClick={() => supabase.auth.signOut()} title="Sair do Sistema" sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Box p={{ xs: 2, md: 4 }} sx={{ maxWidth: '1300px', margin: '0 auto' }}>
            <SummaryCards />
            <Box mb={4}><Charts /></Box>
            <TransactionList />
          </Box>
        </Box>

        <TransactionForm open={openForm} onClose={() => setOpenForm(false)} />
      </FinanceProvider>
    </ThemeProvider>
  );
}