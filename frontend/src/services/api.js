import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor for Multi-tenancy and Auth
api.interceptors.request.use((config) => {
  // 1. Extract tenant from subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // If subdomain exists (e.g., company1.localhost), use it
  if (parts.length > 2 || (parts.length === 2 && parts[1] === 'localhost')) {
    config.headers['x-tenant-slug'] = parts[0];
  } else {
    // Fallback for development: use localStorage or default
    config.headers['x-tenant-slug'] = localStorage.getItem('tenantSlug') || 'default-tenant';
  }

  // 2. Add JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
