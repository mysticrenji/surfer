import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudIcon from '@mui/icons-material/Cloud';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            cursor: 'pointer',
            '&:hover': { opacity: 0.9 }
          }} 
          onClick={() => navigate('/dashboard')}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="Surfer Logo"
            sx={{ 
              height: 40, 
              width: 40, 
              mr: 2,
              filter: 'brightness(0) invert(1)',
            }}
          />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Surfer
          </Typography>
        </Box>
        {user && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              startIcon={<DashboardIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/clusters')}
              startIcon={<CloudIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Clusters
            </Button>
            {user.role === 'admin' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/admin')}
                startIcon={<AdminPanelSettingsIcon />}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Admin
              </Button>
            )}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 2,
              pl: 2,
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.9rem'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 2,
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.name || user.email}
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={logout}
                size="small"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
