import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://79.72.48.151:3010',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TrataTudo:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
