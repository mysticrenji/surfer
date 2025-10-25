import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    status: 'approved',
    picture: '',
    google_id: '123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  test('renders children when user is authenticated and approved', () => {
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redirects to login when user is not authenticated', () => {
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to pending-approval when user status is pending', () => {
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: { ...mockUser, status: 'pending' },
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/pending-approval');
  });

  test('shows loading state', () => {
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
