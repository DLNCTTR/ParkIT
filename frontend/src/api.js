// src/api.js
import axios from 'axios';

// Create an Axios instance with the base URL from the environment variable
const api = axios.create({
  baseURL: 'https://localhost:7155/api' // Base URL of your backend API
});

export default api;

