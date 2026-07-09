import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// request interceptor — attach token 

api.interceptors.request.use(
  (config) => {
    // Read token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('paraLM_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Response interceptor — handle 401 

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('paraLM_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;