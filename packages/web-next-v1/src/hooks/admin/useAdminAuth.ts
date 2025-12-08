"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Hook để quản lý authentication cho admin
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/admin/login");
      setIsLoading(false);
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    router.push("/admin/login");
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    getToken,
  };
}
