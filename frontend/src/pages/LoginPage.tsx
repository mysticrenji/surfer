import React, { useEffect } from 'react';
import { Container, Box, Button, Typography, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.status === 'approved') {
        navigate('/dashboard');
      } else if (user.status === 'pending') {
        navigate('/pending-approval');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const url = await authService.getGoogleLoginUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={10} 
          sx={{ 
            p: 6, 
            borderRadius: 4,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="Surfer Logo"
            sx={{ 
              height: 100, 
              width: 100, 
              mx: 'auto',
              mb: 2,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          />
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Surfer
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Kubernetes Management UI
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Sign in to manage your Kubernetes clusters from a single pane of glass
          </Typography>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0px 8px 20px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sign in with Google
          </Button>
          <Typography 
            variant="caption" 
            display="block"
            align="center" 
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Secure authentication via Google OAuth2
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
