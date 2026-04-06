import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor for Multi-tenancy and Auth
api.interceptors.request.use((config) => {
  // 1. Extract tenant from subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  let tenantSlug = localStorage.getItem('tenantSlug');
  
  if (!tenantSlug) {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // If subdomain exists (e.g., company1.localhost), use it
    if (parts.length > 2 || (parts.length === 2 && parts[1] === 'localhost')) {
      // In production (desktrack-production.up.railway.app), parts[0] is 'desktrack-production'
      // which is likely NOT the tenant slug 'creativefrenzy'.
      // So we only use subdomain if it's NOT the base project name.
      if (parts[0] !== 'desktrack-production') {
        tenantSlug = parts[0];
      }
    }
  }

  // Final fallback
  if (!tenantSlug) {
    tenantSlug = 'creativefrenzy'; // Default for this specific client
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

// Toast notification for permission errors
const showToast = (message, type = 'error') => {
  // Remove existing toast
  const existing = document.getElementById('api-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'api-toast';
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999;
    padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
    display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    animation: toastSlideIn 0.3s ease-out; max-width: 500px;
    ${type === 'error'
      ? 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;'
      : 'background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;'}
  `;
  toast.innerHTML = `
    <span style="font-size: 18px">${type === 'error' ? '🔒' : '✅'}</span>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="margin-left: 8px; background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5; color: inherit;">✕</button>
  `;

  // Add animation keyframes if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `@keyframes toastSlideIn { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

// Response interceptor for handling 401s and 403s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isCheckedIn');
      localStorage.removeItem('tenantSlug');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (error.response && error.response.status === 403) {
      const msg = error.response.data?.error || 'You do not have permission to perform this action.';
      showToast(`Access Denied: ${msg}`);
    }

    return Promise.reject(error);
  }
);

export default api;
