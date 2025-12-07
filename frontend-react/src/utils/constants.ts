// API Base URL configuration
export const getApiBaseUrl = (): string => {
  // Priority 1: Vite environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Priority 2: Window config (injected by build process)
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL;
  }
  
  // Priority 3: Development fallback
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

