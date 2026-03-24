import axios from 'axios';

const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const apiProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

const api = axios.create({
  baseURL: `${apiProtocol}//${apiHost}:8080/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthEndpoint = typeof config.url === 'string' && (
    config.url.includes('/auth/login') || config.url.includes('/auth/register')
  );

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
