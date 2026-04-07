import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://79.72.48.151:3010',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'tt_hub_l0fu7f3tjttw1vp78'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TrataTudo:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@TrataTudo:token');
      localStorage.removeItem('@TrataTudo:user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
