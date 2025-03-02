import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5296';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add a request interceptor to add the token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios; 