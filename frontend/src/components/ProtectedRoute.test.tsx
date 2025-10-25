import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock components for navigation testing
const MockLoginPage = () => <div>Login Page</div>;
const MockPendingPage = () => <div>Pending Approval Page</div>;
const MockDashboardPage = () => <div>Dashboard Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    status: 'approved' as const,
    picture: '',
    google_id: '123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const TestWrapper: React.FC<{ children: React.ReactNode; mockAuthValue: any }> = ({ children, mockAuthValue }) => {
    // Mock the useAuth hook
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue(mockAuthValue);

    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route path="/pending-approval" element={<MockPendingPage />} />
          <Route path="/dashboard" element={<MockDashboardPage />} />
          <Route path="/" element={<ProtectedRoute>{children}</ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    );
  };

  const renderWithRoutes = (children: React.ReactNode, mockAuthValue: any) => {
    return render(<TestWrapper mockAuthValue={mockAuthValue}>{children}</TestWrapper>);
  };

  test('renders children when user is authenticated and approved', () => {
    renderWithRoutes(
      <div>Protected Content</div>,
      {
        user: mockUser,
        loading: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    renderWithRoutes(
      <div>Protected Content</div>,
      {
        user: null,
        loading: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      }
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('redirects to pending-approval when user status is pending', () => {
    const pendingUser = { ...mockUser, status: 'pending' as const };

    renderWithRoutes(
      <div>Protected Content</div>,
      {
        user: pendingUser,
        loading: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      }
    );

    expect(screen.getByText('Pending Approval Page')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    renderWithRoutes(
      <div>Protected Content</div>,
      {
        user: null,
        loading: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
