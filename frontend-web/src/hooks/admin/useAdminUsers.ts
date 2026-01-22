"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  storageUsed: number;
  storageLimit: number;
  role: {
    name: string;
  };
  _count: {
    files: number;
    grantsGiven: number;
    grantsReceived: number;
  };
};

export type AdminUsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Hook để fetch và manage users
 */
export function useAdminUsers(token: string | null, limit = 100) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: { data: AdminUsersResponse } = await response.json();
      setUsers(data.data.users);
      setTotal(data.data.total);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!token) {
      return;
    }

    const action = currentStatus ? "ban" : "unban";
    const loadingToast = toast.loading(
      `${action === "ban" ? "Banning" : "Unbanning"} user...`
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(`User ${action}ned successfully`, { id: loadingToast });
      await fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to ${action} user`,
        { id: loadingToast }
      );
    }
  };

  return {
    users,
    total,
    loading,
    error,
    refetch: fetchUsers,
    toggleUserStatus,
  };
}
