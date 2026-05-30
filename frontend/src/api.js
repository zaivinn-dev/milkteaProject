import axios from 'axios';

const getApiBase = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  // Webpack dev server proxies /api — use relative URLs
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return '';
  }

  // Electron (file://) or production build — backend runs on port 5000
  return 'http://localhost:5000';
};

const api = axios.create({ baseURL: getApiBase() });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
