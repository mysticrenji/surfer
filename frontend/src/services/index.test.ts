import '@testing-library/jest-dom';
import { authService, userService, clusterService, k8sService } from './index';
import api from './api';

jest.mock('./api');

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authService', () => {
    test('getGoogleLoginUrl returns URL', async () => {
      const mockUrl = 'https://google.com/auth';
      (api.get as jest.Mock).mockResolvedValue({ data: { url: mockUrl } });

      const url = await authService.getGoogleLoginUrl();
      expect(url).toBe(mockUrl);
      expect(api.get).toHaveBeenCalledWith('/auth/google/login');
    });

    test('logout clears token and calls API', async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    test('getCurrentUser returns user data', async () => {
      const mockUser = { id: 1, name: 'Test User' };
      (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const user = await authService.getCurrentUser();
      expect(user).toEqual(mockUser);
      expect(api.get).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('userService', () => {
    test('getUsers returns user list', async () => {
      const mockUsers = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const users = await userService.getUsers();
      expect(users).toEqual(mockUsers);
      expect(api.get).toHaveBeenCalledWith('/users');
    });

    test('getPendingUsers returns pending users', async () => {
      const mockUsers = [{ id: 1, status: 'pending' }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const users = await userService.getPendingUsers();
      expect(users).toEqual(mockUsers);
      expect(api.get).toHaveBeenCalledWith('/admin/pending-users');
    });

    test('approveUser calls correct endpoint', async () => {
      const userId = 1;
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await userService.approveUser(userId);
      expect(api.post).toHaveBeenCalledWith(`/admin/approve-user/${userId}`);
    });

    test('rejectUser calls correct endpoint', async () => {
      const userId = 1;
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await userService.rejectUser(userId);
      expect(api.post).toHaveBeenCalledWith(`/admin/reject-user/${userId}`);
    });

    test('updateUserRole updates role', async () => {
      const userId = 1;
      const role = 'admin';
      (api.put as jest.Mock).mockResolvedValue({ data: {} });

      await userService.updateUserRole(userId, role);
      expect(api.put).toHaveBeenCalledWith(`/admin/users/${userId}/role`, { role });
    });
  });

  describe('clusterService', () => {
    test('getClusters returns cluster list', async () => {
      const mockClusters = [{ id: 1, name: 'Cluster 1' }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockClusters });

      const clusters = await clusterService.getClusters();
      expect(clusters).toEqual(mockClusters);
      expect(api.get).toHaveBeenCalledWith('/clusters');
    });

    test('getCluster returns cluster details', async () => {
      const clusterId = 1;
      const mockCluster = { id: clusterId, name: 'Cluster 1' };
      (api.get as jest.Mock).mockResolvedValue({ data: mockCluster });

      const cluster = await clusterService.getCluster(clusterId);
      expect(cluster).toEqual(mockCluster);
      expect(api.get).toHaveBeenCalledWith(`/clusters/${clusterId}`);
    });

    test('addCluster creates new cluster', async () => {
      const clusterData = {
        name: 'New Cluster',
        description: 'Test cluster',
        kubeconfig: 'config',
        context: 'test-context'
      };
      (api.post as jest.Mock).mockResolvedValue({ data: clusterData });

      const result = await clusterService.addCluster(clusterData);
      expect(result).toEqual(clusterData);
      expect(api.post).toHaveBeenCalledWith('/clusters', clusterData);
    });

    test('updateCluster updates cluster', async () => {
      const clusterId = 1;
      const updateData = { name: 'Updated Cluster' };
      (api.put as jest.Mock).mockResolvedValue({ data: updateData });

      const result = await clusterService.updateCluster(clusterId, updateData);
      expect(result).toEqual(updateData);
      expect(api.put).toHaveBeenCalledWith(`/clusters/${clusterId}`, updateData);
    });

    test('deleteCluster removes cluster', async () => {
      const clusterId = 1;
      (api.delete as jest.Mock).mockResolvedValue({ data: {} });

      await clusterService.deleteCluster(clusterId);
      expect(api.delete).toHaveBeenCalledWith(`/clusters/${clusterId}`);
    });

    test('testConnection tests cluster connection', async () => {
      const clusterId = 1;
      const mockResponse = { status: 'connected' };
      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await clusterService.testConnection(clusterId);
      expect(result).toEqual(mockResponse);
      expect(api.post).toHaveBeenCalledWith(`/clusters/${clusterId}/test`);
    });
  });

  describe('k8sService', () => {
    const clusterId = 1;
    const namespace = 'default';
    const podName = 'test-pod';

    test('getNamespaces returns namespaces', async () => {
      const mockNamespaces = [{ metadata: { name: 'default' } }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockNamespaces });

      const namespaces = await k8sService.getNamespaces(clusterId);
      expect(namespaces).toEqual(mockNamespaces);
      expect(api.get).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces`);
    });

    test('getPods returns pods', async () => {
      const mockPods = [{ metadata: { name: 'pod-1' } }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockPods });

      const pods = await k8sService.getPods(clusterId, namespace);
      expect(pods).toEqual(mockPods);
      expect(api.get).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods`);
    });

    test('getDeployments returns deployments', async () => {
      const mockDeployments = [{ metadata: { name: 'deploy-1' } }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockDeployments });

      const deployments = await k8sService.getDeployments(clusterId, namespace);
      expect(deployments).toEqual(mockDeployments);
      expect(api.get).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments`);
    });

    test('getServices returns services', async () => {
      const mockServices = [{ metadata: { name: 'svc-1' } }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const services = await k8sService.getServices(clusterId, namespace);
      expect(services).toEqual(mockServices);
      expect(api.get).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces/${namespace}/services`);
    });

    test('getPodLogs returns logs', async () => {
      const mockLogs = 'test logs';
      (api.get as jest.Mock).mockResolvedValue({ data: mockLogs });

      const logs = await k8sService.getPodLogs(clusterId, namespace, podName);
      expect(logs).toBe(mockLogs);
      expect(api.get).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}/logs?tail=100`);
    });

    test('deletePod removes pod', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: {} });

      await k8sService.deletePod(clusterId, namespace, podName);
      expect(api.delete).toHaveBeenCalledWith(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}`);
    });
  });
});
