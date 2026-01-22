/**
 * Token Manager - Quản lý auth token và kiểm tra expiry
 */

import { STORAGE_KEYS } from "@/lib/constants";

/**
 * JWT Payload structure
 */
type JWTPayload = {
  userId: string;
  walletAddress: string;
  iat: number; // issued at (seconds)
  exp: number; // expiry (seconds)
};

/**
 * Decode JWT payload (không verify signature - chỉ để check expiry)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url payload
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get auth token từ localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Set auth token vào localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

/**
 * Remove auth token khỏi localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Kiểm tra token có hết hạn không
 * @param token - JWT token
 * @param bufferSeconds - Buffer time trước khi hết hạn (default: 60s)
 * @returns true nếu token đã hết hạn hoặc sắp hết hạn
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJWT(token);

  if (!payload?.exp) {
    return true; // Invalid token
  }

  // exp là timestamp (seconds), cộng buffer
  const expiryTime = payload.exp * 1000; // convert to milliseconds
  const now = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return now >= expiryTime - bufferTime;
}

/**
 * Kiểm tra token hiện tại có hợp lệ không
 * @returns true nếu có token và chưa hết hạn
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Get thông tin từ token payload
 */
export function getTokenPayload(): JWTPayload | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  return decodeJWT(token);
}

/**
 * Get userId từ token
 */
export function getUserIdFromToken(): string | null {
  const payload = getTokenPayload();
  return payload?.userId || null;
}

/**
 * Get wallet address từ token
 */
export function getWalletAddressFromToken(): string | null {
  const payload = getTokenPayload();
  return payload?.walletAddress || null;
}

/**
 * Get thời gian còn lại của token (milliseconds)
 * @returns milliseconds cho đến khi hết hạn, hoặc 0 nếu đã hết hạn
 */
export function getTokenTimeRemaining(): number {
  const token = getAuthToken();

  if (!token) {
    return 0;
  }

  const payload = decodeJWT(token);

  if (!payload?.exp) {
    return 0;
  }

  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  const remaining = expiryTime - now;

  return remaining > 0 ? remaining : 0;
}

/**
 * Logout - Clear token và các data liên quan
 */
export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Remove token
  removeAuthToken();

  // Optional: Clear other auth-related data
  // localStorage.removeItem(STORAGE_KEYS.DEVICE_KEY);
  // localStorage.removeItem(STORAGE_KEYS.WRAPPED_PRIVATE_KEY);
  // localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
}

/**
 * Auto-check token expiry và redirect to login nếu hết hạn
 * Sử dụng trong useEffect của layout hoặc auth guard
 */
export function setupTokenExpiryCheck(
  onExpired: () => void,
  checkInterval = 60_000 // 1 minute
): () => void {
  const intervalId = setInterval(() => {
    if (!isAuthenticated()) {
      onExpired();
    }
  }, checkInterval);

  // Cleanup function
  return () => clearInterval(intervalId);
}
