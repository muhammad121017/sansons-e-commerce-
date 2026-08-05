import axios from 'axios';

// Smart API Base URL resolver:
// 1. Uses NEXT_PUBLIC_API_URL if explicitly configured in environment
// 2. On local machine (localhost / 127.0.0.1), connects directly to Django backend at http://127.0.0.1:8000/api/
// 3. On VPS production, uses relative '/api/' which Next.js proxies to backend container
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api/') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api/';
    }
  }
  return '/api/';
};

const BASE = getBaseUrl();

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: inject JWT access token ──────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response Interceptor: auto-refresh access token on 401 ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only retry once, and only on 401 errors that aren't the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== 'undefined' &&
      !original.url?.includes('login/refresh/')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token — clear auth state and notify the app
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:token-cleared'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests that come in while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = BASE.endsWith('/') ? `${BASE}auth/login/refresh/` : `${BASE}/auth/login/refresh/`;
        const { data } = await axios.post(refreshUrl, {
          refresh: refreshToken,
        });

        const newAccess = data.access;
        localStorage.setItem('access_token', newAccess);

        // Update the default headers and retry queued requests
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:token-cleared'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
