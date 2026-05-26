import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the Firebase ID token
api.interceptors.request.use(
  async (config) => {
    // We'll get the token from localStorage or Firebase directly
    // For simplicity, we can store it in localStorage during auth state change
    const token = localStorage.getItem('firebaseIdToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
