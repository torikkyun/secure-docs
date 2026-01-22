/**
 * Validation Utilities
 * Helper functions for validating inputs
 */

// Regex patterns defined at module level for performance
const WALLET_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CID_V0_REGEX = /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/;
const CID_V1_REGEX = /^bafy[0-9a-z]{50,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const FILENAME_UNSAFE_REGEX = /[^a-zA-Z0-9.-]/g;

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  return WALLET_ADDRESS_REGEX.test(address);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate IPFS CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic validation for CIDv0 and CIDv1
  return CID_V0_REGEX.test(cid) || CID_V1_REGEX.test(cid);
}

/**
 * Sanitize filename
 */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(FILENAME_UNSAFE_REGEX, "_");
}

/**
 * Validate username (alphanumeric + underscore, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
