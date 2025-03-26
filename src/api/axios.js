import axios from 'axios';
import { getCookie } from '../utils/cookies';

axios.defaults.baseURL = 'http://localhost:5296';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add a request interceptor to add the token to all requests
axios.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios; 