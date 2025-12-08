"use client";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { useAdminLogin } from "@/hooks/admin/useAdminLogin";

export default function AdminLoginPage() {
  const { login, isLoading } = useAdminLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <AdminLoginForm isLoading={isLoading} onSubmit={login} />
    </div>
  );
}
