import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      status: 'approved',
    },
    logout: jest.fn(),
  }),
}));

describe('Navbar', () => {
  test('renders Surfer title', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Surfer')).toBeInTheDocument();
  });

  test('renders user name', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('renders Clusters link', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Clusters')).toBeInTheDocument();
  });

  test('renders Logout button', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
