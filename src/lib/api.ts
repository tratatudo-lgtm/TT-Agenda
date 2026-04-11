import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HTTP-only cookies
});

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local state and redirect to login if unauthorized
      // This will be handled by the auth store/context
    }
    return Promise.reject(error);
  }
);

export default api;
