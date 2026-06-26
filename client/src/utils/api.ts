import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token (the user's UID or Firebase token)
api.interceptors.request.use(
  (config) => {
    const savedUserStr = localStorage.getItem('sunshine_user');
    if (savedUserStr) {
      try {
        const user = JSON.parse(savedUserStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        } else if (user && user.uid) {
          config.headers.Authorization = `Bearer ${user.uid}`;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage in API interceptor', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
