import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      status: 'approved',
    },
    loading: false,
    setUser: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('ProtectedRoute', () => {
  test('renders children when user is authenticated and approved', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
