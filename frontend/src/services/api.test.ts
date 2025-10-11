import api from './api';

describe('API Service', () => {
  test('api instance is created', () => {
    expect(api).toBeDefined();
  });

  test('api has correct base URL', () => {
    expect(api.defaults.baseURL).toBeDefined();
  });

  test('api has correct headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
