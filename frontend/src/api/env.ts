export const API_URL =
  (typeof process !== 'undefined' && process.env.VITE_BACKEND_URL) ||
  import.meta.env.VITE_BACKEND_URL
