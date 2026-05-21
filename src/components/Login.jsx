import { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography,
  Stack, Alert, InputAdornment, IconButton,
  LinearProgress, Collapse
} from '@mui/material';
import { supabase } from '../services/supabaseClient';

// ── Ícones inline (sem dependência extra) ──────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Regras de senha ────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres',        test: (p) => p.length >= 8 },
  { label: 'Uma letra maiúscula',         test: (p) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula',         test: (p) => /[a-z]/.test(p) },
  { label: 'Um número',                   test: (p) => /\d/.test(p) },
  { label: 'Um caractere especial (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function passwordStrength(password) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 20, label: 'Muito fraca', color: '#EF4444' };
  if (passed === 2) return { score: 40, label: 'Fraca',       color: '#F97316' };
  if (passed === 3) return { score: 60, label: 'Média',       color: '#EAB308' };
  if (passed === 4) return { score: 80, label: 'Forte',       color: '#22C55E' };
  return                { score: 100, label: 'Muito forte',  color: '#10B981' };
}

// ── Helpers de validação ───────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function validate({ email, password, confirmPassword, isSignUp }) {
  const errs = {};
  if (!email.trim())            errs.email    = 'E-mail é obrigatório.';
  else if (!isValidEmail(email)) errs.email   = 'Digite um e-mail válido.';

  if (!password)                errs.password = 'Senha é obrigatória.';
  else if (isSignUp && PASSWORD_RULES.some((r) => !r.test(password)))
                                errs.password = 'A senha não atende todos os requisitos.';
  else if (!isSignUp && password.length < 6)
                                errs.password = 'Senha muito curta.';

  if (isSignUp) {
    if (!confirmPassword)                       errs.confirmPassword = 'Confirme sua senha.';
    else if (confirmPassword !== password)      errs.confirmPassword = 'As senhas não conferem.';
  }
  return errs;
}

// ── Estilos de campo reutilizáveis ─────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    color: '#E2E8F0',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
    '&.Mui-error fieldset': { borderColor: '#EF4444' },
  },
  '& .MuiInputLabel-root': { color: '#94A3B8' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#818CF8' },
  '& .MuiInputLabel-root.Mui-error': { color: '#EF4444' },
  '& .MuiFormHelperText-root': { mx: 0, mt: '6px' },
};

// ══════════════════════════════════════════════════════════════════════════
export default function Login() {
  const [isSignUp, setIsSignUp]               = useState(false);
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [touched, setTouched]                 = useState({});
  const [loading, setLoading]                 = useState(false);
  const [apiError, setApiError]               = useState('');
  const [success, setSuccess]                 = useState('');

  const errors  = validate({ email, password, confirmPassword, isSignUp });
  const strength = isSignUp && password ? passwordStrength(password) : null;

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSwitch = () => {
    setIsSignUp((v) => !v);
    setEmail(''); setPassword(''); setConfirmPassword('');
    setTouched({}); setApiError(''); setSuccess('');
  };

  const handleAuth = async () => {
    // Marca todos os campos como tocados para mostrar erros
    setTouched({ email: true, password: true, confirmPassword: true });
    if (Object.keys(errors).length) return;

    setLoading(true);
    setApiError('');
    setSuccess('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) setApiError(error.message);
      else setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setApiError('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0B0F19',
        p: 2,
        // sutil textura de grade no fundo
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), ' +
          'radial-gradient(circle at 80% 70%, rgba(165,180,252,0.05) 0%, transparent 50%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          bgcolor: '#111827',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Cabeçalho */}
        <Typography
          variant="h5"
          fontWeight="700"
          textAlign="center"
          mb={0.5}
          sx={{
            background: 'linear-gradient(45deg, #6366F1, #A5B4FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Finance Campos
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          {isSignUp ? 'Crie sua conta premium gratuita' : 'Acesse seu painel financeiro'}
        </Typography>

        {/* Feedback global */}
        <Collapse in={!!apiError}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        </Collapse>
        <Collapse in={!!success}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        </Collapse>

        <Stack spacing={2.5}>
          {/* E-mail */}
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => { setEmail(e.target.value); touch('email'); }}
            onBlur={() => touch('email')}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            autoComplete="email"
            sx={fieldSx}
          />

          {/* Senha */}
          <Box>
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => { setPassword(e.target.value); touch('password'); }}
              onBlur={() => touch('password')}
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      sx={{ color: '#64748B', '&:hover': { color: '#818CF8' } }}
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPassword} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Barra de força + checklist (somente no cadastro) */}
            <Collapse in={isSignUp && password.length > 0}>
              <Box mt={1.5}>
                {/* Barra */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength?.score ?? 0}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: strength?.color,
                        transition: 'transform 0.4s ease, background-color 0.3s',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: strength?.color, minWidth: 72, textAlign: 'right' }}>
                    {strength?.label}
                  </Typography>
                </Box>

                {/* Requisitos */}
                <Stack spacing={0.4}>
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(password);
                    return (
                      <Box key={rule.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {ok ? <CheckIcon /> : <XIcon />}
                        <Typography variant="caption" sx={{ color: ok ? '#34D399' : '#94A3B8' }}>
                          {rule.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Collapse>
          </Box>

          {/* Confirmar senha (somente cadastro) */}
          <Collapse in={isSignUp}>
            <TextField
              label="Confirmar senha"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); touch('confirmPassword'); }}
              onBlur={() => touch('confirmPassword')}
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm((v) => !v)}
                      edge="end"
                      sx={{ color: '#64748B', '&:hover': { color: '#818CF8' } }}
                      tabIndex={-1}
                    >
                      <EyeIcon open={showConfirm} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Collapse>

          {/* Botão principal */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleAuth}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
              '&:disabled': { bgcolor: 'rgba(99,102,241,0.4)', color: 'rgba(255,255,255,0.5)' },
            }}
          >
            {loading ? 'Carregando…' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </Stack>

        {/* Alternar modo */}
        <Box mt={3} textAlign="center">
          <Button
            onClick={handleSwitch}
            sx={{ textTransform: 'none', color: '#818CF8', fontWeight: 500 }}
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}