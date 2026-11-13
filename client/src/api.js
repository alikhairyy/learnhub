import axios from 'axios';

// Uses the Vite proxy (/api) locally, or VITE_API_URL when deployed separately
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export default api;
