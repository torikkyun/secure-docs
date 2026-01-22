/**
 * useAuthGuard Hook - Protect routes và tự động check token expiry
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  isAuthenticated,
  setupTokenExpiryCheck,
} from "@/lib/auth/token-manager";

export type AuthGuardOptions = {
  redirectTo?: string;
  checkInterval?: number;
};

/**
 * Hook để protect routes - kiểm tra auth và redirect nếu không authenticated
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const router = useRouter();
  const { redirectTo = "/auth/login", checkInterval = 60_000 } = options;

  useEffect(() => {
    // Initial check
    if (!isAuthenticated()) {
      router.push(redirectTo);
      return;
    }

    // Setup periodic check
    const cleanup = setupTokenExpiryCheck(() => {
      // Token expired, redirect to login
      router.push(redirectTo);
    }, checkInterval);

    return cleanup;
  }, [router, redirectTo, checkInterval]);
}

/**
 * Hook để check auth status nhưng không redirect (cho conditional rendering)
 */
export function useAuth() {
  const authenticated = isAuthenticated();

  return {
    isAuthenticated: authenticated,
  };
}
