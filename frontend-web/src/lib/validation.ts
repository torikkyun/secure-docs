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
  id: string;
  username: string;
  publicKey: string;
  walletAddress?: string;
  email?: string;
};

export function validateUserData(userData: Record<string, unknown>): {
  valid: boolean;
  error?: string;
  data?: UserSearchResult;
} {
  const id = userData.id as string | undefined;
  const publicKey = userData.publicKey as string | undefined;
  const walletAddress = userData.walletAddress as string | undefined;
  const username = userData.username as string | undefined;
  const email = userData.email as string | undefined;

  if (!id) {
    return { valid: false, error: "User ID is missing" };
  }

  if (!publicKey) {
    return {
      valid: false,
      error: "User does not have a public key configured",
    };
  }

  // Wallet address is now optional for frontend logic
  // if (!walletAddress) {
  //   return { valid: false, error: "User does not have a wallet address" };
  // }

  if (!isValidBase64(publicKey)) {
    return {
      valid: false,
      error: "User's public key is not in valid base64 format",
    };
  }

  return {
    valid: true,
    data: {
      id,
      username: username || "Unknown",
      publicKey,
      walletAddress,
      email,
    },
  };
}
