import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import api from '../services/api';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=oauth_error');
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state parameter');
        navigate('/login?error=invalid_callback');
        return;
      }

      try {
        // Send the code and state to backend for processing
        const response = await api.get(`/auth/google/callback?code=${code}&state=${state}`);

        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          navigate('/dashboard');
        } else {
          // User needs approval
          navigate('/pending-approval');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
