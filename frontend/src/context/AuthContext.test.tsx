import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { User } from '../types';

// Mock auth service
jest.mock('../services', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock implementation of Storage
const mockStorage = () => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
};

Object.defineProperty(window, 'localStorage', { value: mockStorage() });

// Test component that uses the auth context
const TestComponent = () => {
  const { user, setUser, logout } = useAuth();
  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-email">{user.email}</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => setUser({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          status: 'approved',
          picture: '',
          google_id: '123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })}>Login</button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides user context when logged in', async () => {
    const mockUser: User = {
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

    // Setup mock responses
    jest.spyOn(localStorage, 'getItem').mockReturnValue('dummy-token');
    const getCurrentUser = require('../services').authService.getCurrentUser;
    getCurrentUser.mockResolvedValueOnce(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  test('handles login', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    const loginButton = screen.getByText('Login');
    await act(async () => {
      await userEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  test('handles logout', async () => {
    const mockUser: User = {
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

    // Setup mock responses
    jest.spyOn(localStorage, 'getItem').mockReturnValue('dummy-token');
    const getCurrentUser = require('../services').authService.getCurrentUser;
    getCurrentUser.mockResolvedValueOnce(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    const logoutButton = screen.getByText('Logout');

    // Mock window.location.href
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });

    await act(async () => {
      await userEvent.click(logoutButton);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(window.location.href).toBe('/login');

    // Restore window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  test('initializes with no user when localStorage is empty', async () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
