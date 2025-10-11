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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clusters/add')}
          >
            Add Cluster
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : clusters.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="textSecondary">
                No clusters configured yet
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2 }}>
                Add your first Kubernetes cluster to get started
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {clusters.map((cluster) => (
              <Grid item xs={12} md={6} lg={4} key={cluster.id}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                  onClick={() => navigate(`/clusters/${cluster.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {cluster.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cluster.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      Context: {cluster.context || 'default'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default DashboardPage;
