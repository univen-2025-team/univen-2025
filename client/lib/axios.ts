import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config/app';

const BASE_URL = API_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Helper to get tokens from storage
const getTokens = () => {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };

    try {
        const persistedState = localStorage.getItem('persist:root');
        if (persistedState) {
            const parsed = JSON.parse(persistedState);
            const authState = JSON.parse(parsed.auth);
            return {
                accessToken: authState.accessToken || null,
                refreshToken: authState.refreshToken || null
            };
        }
    } catch {
        // Fallback
    }

    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
    };
};

// Helper to update tokens in storage
const updateTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    try {
        const persistedState = localStorage.getItem('persist:root');
        if (persistedState) {
            const parsed = JSON.parse(persistedState);
            const authState = JSON.parse(parsed.auth);
            authState.accessToken = accessToken;
            authState.refreshToken = refreshToken;
            parsed.auth = JSON.stringify(authState);
            localStorage.setItem('persist:root', JSON.stringify(parsed));
        }
    } catch {
        // Ignore parse errors
    }
};

// Helper to clear auth and redirect
const clearAuthAndRedirect = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('persist:root');

    // Use replace to prevent back navigation to protected page
    window.location.replace('/auth/login');
};

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const { accessToken } = getTokens();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle network errors
        if (!error.response) {
            console.error('❌ Network error:', error.message);
            return Promise.reject(error);
        }

        const status = error.response.status;

        // Handle 401/403 - Token expired or invalid
        if ((status === 401 || status === 403) && !originalRequest._retry) {
            // Skip token refresh for auth endpoints
            if (originalRequest.url?.includes('/auth/')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue this request until token is refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { refreshToken } = getTokens();

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Request new tokens
                const response = await axios.post(`${BASE_URL}/auth/new-token`, {
                    refreshToken
                });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                    response.data.metadata;

                updateTokens(newAccessToken, newRefreshToken);
                processQueue(null, newAccessToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
