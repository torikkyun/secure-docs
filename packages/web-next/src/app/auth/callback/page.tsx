"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        router.push("/login?error=auth_failed");
        return;
      }

      if (data.session?.user) {
        const user = data.session.user;

        // Gọi API backend
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                username: user.user_metadata?.full_name || user.email,
              }),
            }
          );

          if (response.ok) {
            router.push("/");
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error("API call failed:", error);
          router.push("/"); // Vẫn chuyển hướng dù API fail
        }
      } else {
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Đang xử lý đăng nhập...</div>;
}
