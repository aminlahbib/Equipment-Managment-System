// Environment-aware API configuration
// Supports Vercel environment variables and local development

const getApiBaseUrl = () => {
  // Priority 1: Vercel environment variable (VITE_API_BASE_URL)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Priority 2: Window config (injected by Vercel or build process)
  if (typeof window !== 'undefined' && window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  
  // Priority 3: Check for Vercel environment variable (process.env)
  if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  
  // Priority 4: Development fallback
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log API base URL in development (helps with debugging)
if (API_BASE_URL.includes('localhost')) {
  console.log('Using development API:', API_BASE_URL);
}

