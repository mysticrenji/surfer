import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  CardActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon,
  CloudQueue as CloudIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clusterService } from '../services';
import { Cluster } from '../types';

const DashboardPage: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      const data = await clusterService.getClusters();
      setClusters(data);
    } catch (error) {
      console.error('Failed to load clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={4}
            sx={{
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your Kubernetes clusters
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/clusters/add')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                },
              }}
            >
              Add Cluster
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress size={60} />
            </Box>
          ) : clusters.length === 0 ? (
            <Card 
              sx={{ 
                textAlign: 'center',
                py: 8,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              }}
            >
              <CardContent>
                <CloudIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  No clusters configured yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first Kubernetes cluster to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/clusters/add')}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    },
                  }}
                >
                  Add Your First Cluster
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {clusters.map((cluster) => (
                <Grid item xs={12} sm={6} lg={4} key={cluster.id}>
                  <Card
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                    }}
                    onClick={() => navigate(`/clusters/${cluster.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <CloudIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              mb: 0.5,
                            }}
                          >
                            {cluster.name}
                          </Typography>
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Connected" 
                            size="small" 
                            color="success"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          minHeight: 40,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cluster.description || 'No description provided'}
                      </Typography>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block">
                          Context
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        >
                          {cluster.context || 'default'}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Tooltip title="Configure">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clusters/${cluster.id}/settings`);
                          }}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;
