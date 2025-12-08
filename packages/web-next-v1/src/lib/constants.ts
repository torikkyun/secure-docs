/**
 * Application Constants
 * Định nghĩa các hằng số dùng chung trong toàn bộ app
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  TIMEOUT: 30_000, // 30 seconds
} as const;

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_URL: "https://api.pinata.cloud",
  GATEWAY_URL: "https://gateway.pinata.cloud/ipfs",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  DEVICE_KEY: "secure_docs_device_key",
  WRAPPED_PRIVATE_KEY: "secure_docs_wrapped_priv_key",
  PUBLIC_KEY: "secure_docs_public_key",
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  FILES_LIMIT: 20,
  SHARES_LIMIT: 20,
  DOWNLOADS_LIMIT: 20,
  RECENT_FILES_LIMIT: 4,
  RECENT_DOWNLOADS_LIMIT: 5,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: [
    "image/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/*",
  ],
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  FILES: "/files",
  SHARES: "/shares",
  DOWNLOADS: "/downloads",
  SETTINGS: "/settings",
} as const;

// File Status
export const FILE_STATUS = {
  ACTIVE: "active",
  DELETED: "deleted",
  PENDING: "pending",
} as const;

// Share Status
export const SHARE_STATUS = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

// Download Status
export const DOWNLOAD_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  PENDING: "pending",
} as const;
