import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { k8sService } from '../services';
import { Namespace, Pod, Deployment, Service } from '../types';

const ClusterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const clusterId = parseInt(id || '0');

  const [tabValue, setTabValue] = useState(0);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNamespaces();
  }, [clusterId]);

  useEffect(() => {
    if (selectedNamespace) {
      loadResources();
    }
  }, [selectedNamespace, tabValue]);

  const loadNamespaces = async () => {
    try {
      const data = await k8sService.getNamespaces(clusterId);
      setNamespaces(data);
      if (data.length > 0) {
        setSelectedNamespace(data[0].metadata.name);
      }
    } catch (error) {
      console.error('Failed to load namespaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        const data = await k8sService.getPods(clusterId, selectedNamespace);
        setPods(data);
      } else if (tabValue === 1) {
        const data = await k8sService.getDeployments(clusterId, selectedNamespace);
        setDeployments(data);
      } else if (tabValue === 2) {
        const data = await k8sService.getServices(clusterId, selectedNamespace);
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Cluster Resources
        </Typography>

        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel>Namespace</InputLabel>
            <Select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              label="Namespace"
            >
              {namespaces.map((ns) => (
                <MenuItem key={ns.metadata.name} value={ns.metadata.name}>
                  {ns.metadata.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
            <Tab label="Pods" />
            <Tab label="Deployments" />
            <Tab label="Services" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Age</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pods.map((pod) => (
                      <TableRow key={pod.metadata.name}>
                        <TableCell>{pod.metadata.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={pod.status.phase}
                            color={getStatusColor(pod.status.phase)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{pod.status.podIP || '-'}</TableCell>
                        <TableCell>
                          {new Date(pod.metadata.creationTimestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 1 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Ready</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Age</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deployments.map((deployment) => (
                      <TableRow key={deployment.metadata.name}>
                        <TableCell>{deployment.metadata.name}</TableCell>
                        <TableCell>
                          {deployment.status.readyReplicas || 0}/{deployment.status.replicas || 0}
                        </TableCell>
                        <TableCell>{deployment.status.availableReplicas || 0}</TableCell>
                        <TableCell>
                          {new Date(deployment.metadata.creationTimestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 2 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Cluster IP</TableCell>
                      <TableCell>Ports</TableCell>
                      <TableCell>Age</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.metadata.name}>
                        <TableCell>{service.metadata.name}</TableCell>
                        <TableCell>{service.spec.type}</TableCell>
                        <TableCell>{service.spec.clusterIP}</TableCell>
                        <TableCell>
                          {service.spec.ports.map((p) => `${p.port}/${p.protocol}`).join(', ')}
                        </TableCell>
                        <TableCell>
                          {new Date(service.metadata.creationTimestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default ClusterDetailsPage;
