import api from './api';
import { User } from '../types';

export const authService = {
  getGoogleLoginUrl: async () => {
    const response = await api.get('/auth/google/login');
    return response.data.url;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getPendingUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },

  approveUser: async (userId: number) => {
    const response = await api.post(`/admin/approve-user/${userId}`);
    return response.data;
  },

  rejectUser: async (userId: number) => {
    const response = await api.post(`/admin/reject-user/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export const clusterService = {
  getClusters: async () => {
    const response = await api.get('/clusters');
    return response.data;
  },

  getCluster: async (id: number) => {
    const response = await api.get(`/clusters/${id}`);
    return response.data;
  },

  addCluster: async (data: { name: string; description: string; kubeconfig: string; context: string }) => {
    const response = await api.post('/clusters', data);
    return response.data;
  },

  updateCluster: async (id: number, data: any) => {
    const response = await api.put(`/clusters/${id}`, data);
    return response.data;
  },

  deleteCluster: async (id: number) => {
    const response = await api.delete(`/clusters/${id}`);
    return response.data;
  },

  testConnection: async (id: number) => {
    const response = await api.post(`/clusters/${id}/test`);
    return response.data;
  },
};

export const k8sService = {
  getNamespaces: async (clusterId: number) => {
    const response = await api.get(`/k8s/clusters/${clusterId}/namespaces`);
    return response.data;
  },

  getPods: async (clusterId: number, namespace: string) => {
    const response = await api.get(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods`);
    return response.data;
  },

  getDeployments: async (clusterId: number, namespace: string) => {
    const response = await api.get(`/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments`);
    return response.data;
  },

  getServices: async (clusterId: number, namespace: string) => {
    const response = await api.get(`/k8s/clusters/${clusterId}/namespaces/${namespace}/services`);
    return response.data;
  },

  getPodLogs: async (clusterId: number, namespace: string, podName: string, tail: number = 100) => {
    const response = await api.get(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}/logs?tail=${tail}`);
    return response.data;
  },

  deletePod: async (clusterId: number, namespace: string, podName: string) => {
    const response = await api.delete(`/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}`);
    return response.data;
  },
};
