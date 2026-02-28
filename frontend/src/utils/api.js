import axios from 'axios';

// Dev: VITE_API_URL không set → dùng Vite proxy '/api'
// Prod: VITE_API_URL = https://xxx.up.railway.app → tự ghép thành .../api
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sps_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('sps_token');
      localStorage.removeItem('sps_user');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
