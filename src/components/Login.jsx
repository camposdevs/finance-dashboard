import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else alert('Verifique seu e-mail para confirmar o cadastro!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0B0F19', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 400, bgcolor: '#111827', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="h5" fontWeight="700" textAlign="center" mb={1} sx={{ background: 'linear-gradient(45deg, #6366F1, #A5B4FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Finance Campos
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          {isSignUp ? 'Crie sua conta premium gratuita' : 'Acesse seu painel financeiro'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleAuth}>
          <Stack spacing={3}>
            <TextField label="E-mail" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Senha" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <Button variant="contained" type="submit" fullWidth disabled={loading} sx={{ py: 1.5, borderRadius: '10px', fontWeight: 600, textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </Stack>
        </form>

        <Box mt={3} textAlign="center">
          <Button onClick={() => setIsSignUp(!isSignUp)} sx={{ textTransform: 'none', color: '#818CF8', fontWeight: 500 }}>
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}