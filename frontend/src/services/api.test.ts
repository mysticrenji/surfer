import axios, { AxiosRequestConfig } from 'axios';
import api from './api';
import MockAdapter from 'axios-mock-adapter';

// Setup localStorage mock
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    localStorage.clear();
    mockAxios = new MockAdapter(api);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  test('api instance is created', () => {
    expect(api).toBeDefined();
  });

  test('api has correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080/api/v1');
  });

  test('api has correct headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('adds authorization header when token exists', async () => {
    const token = 'test-token';
    localStorage.setItem('auth_token', token);

    mockAxios.onGet('/test').reply((config: AxiosRequestConfig) => {
      expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
      return [200, {}];
    });

    await api.get('/test');
  });

  test('does not add authorization header when token does not exist', async () => {
    mockAxios.onGet('/test').reply((config: AxiosRequestConfig) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, {}];
    });

    await api.get('/test');
  });

  test('redirects to login on 401 response', async () => {
    // Mock window.location
    const mockLocation = { href: '' };
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: mockLocation,
    });

    mockAxios.onGet('/test').reply(401);

    try {
      await api.get('/test');
    } catch (error) {
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(mockLocation.href).toBe('/login');
    }

    // Restore window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  test('propagates non-401 errors', async () => {
    mockAxios.onGet('/test').reply(500, { message: 'Server error' });

    try {
      await api.get('/test');
      fail('Expected error to be thrown');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toEqual({ message: 'Server error' });
      } else {
        fail('Expected AxiosError');
      }
    }
  });
});
