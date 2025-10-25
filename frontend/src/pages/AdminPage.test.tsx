import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import { userService } from '../services';
import { AuthProvider } from '../context/AuthContext';

// Mock userService
jest.mock('../services', () => ({
  userService: {
    getPendingUsers: jest.fn(),
    approveUser: jest.fn(),
    rejectUser: jest.fn(),
  },
}));

describe('AdminPage', () => {
  const mockPendingUsers = [
    {
      id: 1,
      name: 'Test User 1',
      email: 'test1@example.com',
      status: 'pending',
      role: 'user',
      picture: '',
      google_id: '123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Test User 2',
      email: 'test2@example.com',
      status: 'pending',
      role: 'user',
      picture: '',
      google_id: '456',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getPendingUsers as jest.Mock).mockResolvedValue(mockPendingUsers);
  });

  const renderAdminPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AdminPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders admin page with pending users', async () => {
    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    (userService.getPendingUsers as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    renderAdminPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('handles empty pending users state', async () => {
    (userService.getPendingUsers as jest.Mock).mockResolvedValue([]);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('No pending user approvals')).toBeInTheDocument();
    });
  });

  test('approves a user', async () => {
    (userService.approveUser as jest.Mock).mockResolvedValue({});

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByText('Approve');
    await act(async () => {
      await userEvent.click(approveButtons[0]);
    });

    expect(userService.approveUser).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });
  });

  test('rejects a user', async () => {
    (userService.rejectUser as jest.Mock).mockResolvedValue({});

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      await userEvent.click(rejectButtons[0]);
    });

    expect(userService.rejectUser).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });
  });

  test('handles approve error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (userService.approveUser as jest.Mock).mockRejectedValue(new Error('Failed to approve'));

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByText('Approve');
    await act(async () => {
      await userEvent.click(approveButtons[0]);
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to approve user:', expect.any(Error));
    expect(screen.getByText('Test User 1')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  test('handles reject error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (userService.rejectUser as jest.Mock).mockRejectedValue(new Error('Failed to reject'));

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      await userEvent.click(rejectButtons[0]);
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to reject user:', expect.any(Error));
    expect(screen.getByText('Test User 1')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  test('handles load error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (userService.getPendingUsers as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    renderAdminPage();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load pending users:', expect.any(Error));
    });

    consoleError.mockRestore();
  });
});
