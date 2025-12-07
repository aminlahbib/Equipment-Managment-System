// Environment-aware API configuration
// Supports Vercel environment variables and local development

const getApiBaseUrl = () => {
  try {
    // Priority 1: Vercel environment variable (VITE_API_BASE_URL)
    // Note: import.meta.env is specific to Vite and might not be present in vanilla environments
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // Ignore errors if import.meta is not supported or env is missing
  }
  
  // Priority 2: Window config (injected by Vercel or build process)
  if (typeof window !== 'undefined' && window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  
  // Priority 3: Check for Vercel environment variable (process.env)
  // Note: process is defined in Node.js environments, not typically in browsers
  try {
      if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
        return process.env.VITE_API_BASE_URL;
      }
  } catch (e) {
      // Ignore
  }
  
  // Priority 4: Development fallback
  // If we are running on localhost, assume backend is at localhost:8080
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log API base URL in development (helps with debugging)
if (API_BASE_URL.includes('localhost')) {
  console.log('Using development API:', API_BASE_URL);
}
