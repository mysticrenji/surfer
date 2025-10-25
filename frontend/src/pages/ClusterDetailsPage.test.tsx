import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ClusterDetailsPage from './ClusterDetailsPage';
import { k8sService } from '../services';
import { AuthProvider } from '../context/AuthContext';

// Mock k8sService
jest.mock('../services', () => ({
  k8sService: {
    getNamespaces: jest.fn(),
    getPods: jest.fn(),
    getDeployments: jest.fn(),
    getServices: jest.fn(),
  },
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

describe('ClusterDetailsPage', () => {
  const mockNamespaces = [
    {
      metadata: {
        name: 'default',
        creationTimestamp: '2023-01-01T00:00:00Z',
      },
      status: { phase: 'Active' },
    },
    {
      metadata: {
        name: 'kube-system',
        creationTimestamp: '2023-01-01T00:00:00Z',
      },
      status: { phase: 'Active' },
    },
  ];

  const mockPods = [
    {
      metadata: {
        name: 'test-pod',
        namespace: 'default',
        creationTimestamp: '2023-01-01T00:00:00Z',
      },
      status: {
        phase: 'Running',
        podIP: '10.0.0.1',
      },
      spec: {
        containers: [
          {
            name: 'test-container',
            image: 'nginx:latest',
          },
        ],
      },
    },
  ];

  const mockDeployments = [
    {
      metadata: {
        name: 'test-deployment',
        namespace: 'default',
        creationTimestamp: '2023-01-01T00:00:00Z',
      },
      status: {
        replicas: 3,
        readyReplicas: 3,
        availableReplicas: 3,
      },
    },
  ];

  const mockServices = [
    {
      metadata: {
        name: 'test-service',
        namespace: 'default',
        creationTimestamp: '2023-01-01T00:00:00Z',
      },
      spec: {
        type: 'ClusterIP',
        clusterIP: '10.0.0.1',
        ports: [
          {
            port: 80,
            targetPort: 8080,
            protocol: 'TCP',
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (k8sService.getNamespaces as jest.Mock).mockResolvedValue(mockNamespaces);
    (k8sService.getPods as jest.Mock).mockResolvedValue(mockPods);
    (k8sService.getDeployments as jest.Mock).mockResolvedValue(mockDeployments);
    (k8sService.getServices as jest.Mock).mockResolvedValue(mockServices);
  });

  const renderClusterDetailsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ClusterDetailsPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders cluster details page with namespaces', async () => {
    renderClusterDetailsPage();

    await waitFor(() => {
      expect(screen.getByText('Cluster Resources')).toBeInTheDocument();
    });

    expect(k8sService.getNamespaces).toHaveBeenCalledWith(1);
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('kube-system')).toBeInTheDocument();
  });

  test('loads and displays pods', async () => {
    renderClusterDetailsPage();

    await waitFor(() => {
      expect(screen.getByText('test-pod')).toBeInTheDocument();
    });

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
  });

  test('switches to deployments tab and displays deployments', async () => {
    renderClusterDetailsPage();

    const deploymentsTab = screen.getByText('Deployments');
    await act(async () => {
      fireEvent.click(deploymentsTab);
    });

    await waitFor(() => {
      expect(screen.getByText('test-deployment')).toBeInTheDocument();
    });

    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  test('switches to services tab and displays services', async () => {
    renderClusterDetailsPage();

    const servicesTab = screen.getByText('Services');
    await act(async () => {
      fireEvent.click(servicesTab);
    });

    await waitFor(() => {
      expect(screen.getByText('test-service')).toBeInTheDocument();
    });

    expect(screen.getByText('ClusterIP')).toBeInTheDocument();
    expect(screen.getByText('80/TCP')).toBeInTheDocument();
  });

  test('changes namespace and reloads resources', async () => {
    renderClusterDetailsPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Namespace')).toBeInTheDocument();
    });

    const namespaceSelect = screen.getByLabelText('Namespace');
    await act(async () => {
      await userEvent.click(namespaceSelect);
    });

    const kubeSystemOption = screen.getByText('kube-system');
    await act(async () => {
      await userEvent.click(kubeSystemOption);
    });

    expect(k8sService.getPods).toHaveBeenCalledWith(1, 'kube-system');
  });

  test('handles loading state', async () => {
    (k8sService.getNamespaces as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderClusterDetailsPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (k8sService.getNamespaces as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    renderClusterDetailsPage();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load namespaces:', expect.any(Error));
    });

    consoleError.mockRestore();
  });
});
