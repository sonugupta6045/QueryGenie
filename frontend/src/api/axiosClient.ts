import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { getNewToken } from './refreshQueue';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject the token from Redux store
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We do NOT use localStorage anymore for accessToken
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh using single-flight queue
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and it's not a retry request itself
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Prevent infinite loops if the refresh endpoint itself returns 401
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await getNewToken();
        
        // Update original request header and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (handled by getNewToken which dispatches setSessionExpired).
        // Do NOT use window.location.href for hard redirect here.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
