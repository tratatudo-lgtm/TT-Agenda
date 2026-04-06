import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar a API Key a todos os pedidos autenticados
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('@TrataTudo:apiKey');
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export default api;
