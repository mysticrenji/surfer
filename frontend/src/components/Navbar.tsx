import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Surfer
        </Typography>
        {user && (
          <Box>
            {user.role === 'admin' && (
              <Button color="inherit" onClick={() => navigate('/admin')}>
                Admin Panel
              </Button>
            )}
            <Button color="inherit" onClick={() => navigate('/clusters')}>
              Clusters
            </Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>
              {user.name || user.email}
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
