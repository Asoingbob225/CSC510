import axios from 'axios';

// Token management
export const TOKEN_KEY = 'eatsential_auth_token';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api', // Use relative path, Vite will proxy automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear and redirect to login page
      clearAuthToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
