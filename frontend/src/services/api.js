import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor for Multi-tenancy and Auth
api.interceptors.request.use((config) => {
  // 1. Extract tenant from subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  let tenantSlug = null;
  // If subdomain exists (e.g., company1.localhost), use it
  if (parts.length > 2 || (parts.length === 2 && parts[1] === 'localhost')) {
    tenantSlug = parts[0];
  } else {
    // Fallback for development: use localStorage or default
    tenantSlug = localStorage.getItem('tenantSlug') || 'default-tenant';
  }

  config.headers['x-tenant-slug'] = tenantSlug;
  console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} | Tenant: ${tenantSlug}`);

  // 2. Add JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for handling 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isCheckedIn');
      localStorage.removeItem('tenantSlug');
      
      // If we're not already on the login page, redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
