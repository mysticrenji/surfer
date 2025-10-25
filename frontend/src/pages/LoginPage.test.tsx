import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services';

// Mock the auth service
jest.mock('../services', () => ({
  authService: {
    getGoogleLoginUrl: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders login page elements', () => {
    renderLoginPage();

    expect(screen.getByText('Surfer')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes Management UI')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByAltText('Surfer Logo')).toBeInTheDocument();
  });

  test('handles Google login button click', async () => {
    const mockUrl = 'https://google.com/auth';
    (authService.getGoogleLoginUrl as jest.Mock).mockResolvedValue(mockUrl);

    // Mock window.location.href
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });

    renderLoginPage();

    const loginButton = screen.getByText('Sign in with Google');
    await act(async () => {
      await userEvent.click(loginButton);
    });

    expect(authService.getGoogleLoginUrl).toHaveBeenCalled();
    expect(window.location.href).toBe(mockUrl);

    // Restore window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  test('handles login error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (authService.getGoogleLoginUrl as jest.Mock).mockRejectedValue(new Error('Login failed'));

    renderLoginPage();

    const loginButton = screen.getByText('Sign in with Google');
    await act(async () => {
      await userEvent.click(loginButton);
    });

    expect(authService.getGoogleLoginUrl).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Login error:', expect.any(Error));

    consoleError.mockRestore();
  });

  test('redirects approved user to dashboard', async () => {
    // Mock useAuth to return approved user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        status: 'approved',
        picture: '',
        google_id: '123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    renderLoginPage();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('redirects pending user to pending approval page', async () => {
    // Mock useAuth to return pending user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        status: 'pending',
        picture: '',
        google_id: '123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      loading: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    renderLoginPage();

    expect(mockNavigate).toHaveBeenCalledWith('/pending-approval');
  });
});
