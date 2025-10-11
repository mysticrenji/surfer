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
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h3" align="center" gutterBottom>
            🏄 Surfer
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Kubernetes Management UI
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            Sign in to manage your Kubernetes clusters
          </Typography>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
