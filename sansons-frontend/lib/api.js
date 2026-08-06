import axios from 'axios';

// Smart API Base URL resolver:
// 1. Uses NEXT_PUBLIC_API_URL if explicitly configured to full URL
// 2. On browser client (typeof window !== 'undefined'):
//    - Localhost -> http://127.0.0.1:8000/api/
//    - VPS / Production -> '/api/' (proxied by Next.js rewrite)
// 3. On server (Node.js SSR):
//    - VPS Docker container -> http://sansons_backend:8000/api/
//    - Local dev server -> http://127.0.0.1:8000/api/
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api/') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api/';
    }
    return '/api/';
  }
  // Server-side Node.js SSR
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'http://sansons_backend:8000/api/';
  }
  return 'http://127.0.0.1:8000/api/';
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

    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== 'undefined' &&
      !original.url?.includes('login/refresh/')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:token-cleared'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
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
