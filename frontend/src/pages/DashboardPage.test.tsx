import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { clusterService } from '../services';
import { AuthProvider } from '../context/AuthContext';

// Mock clusterService
jest.mock('../services', () => ({
  clusterService: {
    getClusters: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DashboardPage', () => {
  const mockClusters = [
    {
      id: 1,
      name: 'Test Cluster 1',
      description: 'Test Description 1',
      context: 'test-context-1',
      created_by: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Test Cluster 2',
      description: 'Test Description 2',
      context: 'test-context-2',
      created_by: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (clusterService.getClusters as jest.Mock).mockResolvedValue(mockClusters);
  });

  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders dashboard with clusters', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Test Cluster 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Cluster 2')).toBeInTheDocument();
    expect(screen.getByText('test-context-1')).toBeInTheDocument();
    expect(screen.getByText('test-context-2')).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    (clusterService.getClusters as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderDashboardPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('handles empty clusters state', async () => {
    (clusterService.getClusters as jest.Mock).mockResolvedValue([]);

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('No clusters configured yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Your First Cluster')).toBeInTheDocument();
  });

  test('navigates to add cluster page', async () => {
    renderDashboardPage();

    const addButton = screen.getByText('Add Cluster');
    await act(async () => {
      await userEvent.click(addButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/add');
  });

  test('navigates to cluster details on card click', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Test Cluster 1')).toBeInTheDocument();
    });

    const clusterCard = screen.getByText('Test Cluster 1').closest('.MuiCard-root');
    if (!clusterCard) throw new Error('Cluster card not found');

    await act(async () => {
      await userEvent.click(clusterCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/1');
  });

  test('navigates to cluster settings', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getAllByTitle('Configure')[0]).toBeInTheDocument();
    });

    const settingsButton = screen.getAllByTitle('Configure')[0];
    await act(async () => {
      await userEvent.click(settingsButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/1/settings');
  });

  test('handles error state', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (clusterService.getClusters as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    renderDashboardPage();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load clusters:', expect.any(Error));
    });

    consoleError.mockRestore();
  });
});
