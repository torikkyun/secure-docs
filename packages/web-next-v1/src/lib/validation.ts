/**
 * Validation utilities
 */

export const BASE64_REGEX = /^[A-Za-z0-9+/=]+$/;

export function isValidEmail(email: string): boolean {
  return email.includes("@");
}

export function isValidBase64(str: string): boolean {
  return BASE64_REGEX.test(str);
}

export type UserSearchResult = {
  username: string;
  publicKey: string;
  walletAddress: string;
  email?: string;
};

export function validateUserData(userData: Record<string, unknown>): {
  valid: boolean;
  error?: string;
  data?: UserSearchResult;
} {
  const publicKey = userData.publicKey as string | undefined;
  const walletAddress = userData.walletAddress as string | undefined;
  const username = userData.username as string | undefined;
  const email = userData.email as string | undefined;

  if (!publicKey) {
    return {
      valid: false,
      error: "User does not have a public key configured",
    };
  }

  if (!walletAddress) {
    return { valid: false, error: "User does not have a wallet address" };
  }

  if (!isValidBase64(publicKey)) {
    return {
      valid: false,
      error: "User's public key is not in valid base64 format",
    };
  }

  return {
    valid: true,
    data: {
      username: username || "Unknown",
      publicKey,
      walletAddress,
      email,
    },
  };
}
