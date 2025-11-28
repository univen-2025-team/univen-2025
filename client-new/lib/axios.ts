import axios from 'axios';

// Base URL cho API
// Default to HTTP for local development (server runs on HTTP, not HTTPS)
// Set NEXT_PUBLIC_API_URL in .env.local to override
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1/api';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (Redux Persist stores it there)
    let token = null;

    if (typeof window !== 'undefined') {
      // Try to get from Redux Persist storage first
      const persistedState = localStorage.getItem('persist:root');
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState);
          const authState = JSON.parse(parsed.auth);
          token = authState.accessToken;
        } catch {
          // Fallback to direct localStorage access
          token = localStorage.getItem('accessToken');
        }
      } else {
        token = localStorage.getItem('accessToken');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (server not reachable)
    if (!error.response) {
      console.error('❌ Không thể kết nối tới server:', {
        url: originalRequest?.url,
        baseURL: BASE_URL,
        error: error.message,
        hint: 'Kiểm tra xem server có đang chạy không và NEXT_PUBLIC_API_URL có đúng không'
      });

      // Show user-friendly error in development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const errorMsg = `Không thể kết nối tới server tại ${BASE_URL}. Vui lòng kiểm tra:\n1. Server có đang chạy không?\n2. URL API có đúng không?`;
        console.error(errorMsg);
      }

      return Promise.reject(error);
    }

    // Handle 401 (Unauthorized) or 403 (Forbidden) - both indicate token issues
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage or Redux Persist
        let refreshToken = null;

        if (typeof window !== 'undefined') {
          const persistedState = localStorage.getItem('persist:root');
          if (persistedState) {
            try {
              const parsed = JSON.parse(persistedState);
              const authState = JSON.parse(parsed.auth);
              refreshToken = authState.refreshToken;
            } catch {
              refreshToken = localStorage.getItem('refreshToken');
            }
          } else {
            refreshToken = localStorage.getItem('refreshToken');
          }
        }

        if (!refreshToken) {
          // No refresh token, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/auth/login';
          }
          return Promise.reject(error);
        }

        // Request new access token
        const response = await axios.post(`${BASE_URL}/auth/new-token`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.metadata;

        // Update both localStorage and Redux Persist storage
        if (typeof window !== 'undefined') {
          // Update direct localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update Redux Persist storage
          const persistedState = localStorage.getItem('persist:root');
          if (persistedState) {
            try {
              const parsed = JSON.parse(persistedState);
              const authState = JSON.parse(parsed.auth);
              authState.accessToken = accessToken;
              authState.refreshToken = newRefreshToken;
              parsed.auth = JSON.stringify(authState);
              localStorage.setItem('persist:root', JSON.stringify(parsed));
            } catch {
              // If parsing fails, just rely on direct localStorage
            }
          }
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Refresh token failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
