"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook để xử lý admin login
 */
export function useAdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      if (data.success && data.data.token) {
        localStorage.setItem("auth_token", data.data.token);
        toast.success("Đăng nhập thành công", {
          description: "Chào mừng Admin quay trở lại",
        });
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Lỗi đăng nhập", {
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra lại thông tin",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
