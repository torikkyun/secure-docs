import { ApiClient } from "@/lib/api/client";
import type { StorageInfo, User } from "@/types/api";

/**
 * User Service - Quản lý các API liên quan đến user
 */
export const userService = {
  /**
   * Lấy thông tin profile của user hiện tại
   */
  getProfile: () => ApiClient.get<User>("/api/users/profile"),

  /**
   * Cập nhật thông tin profile
   */
  updateProfile: (data: { username?: string; email?: string }) =>
    ApiClient.patch<User>("/api/users/profile", data),

  /**
   * Lấy thông tin storage của user
   */
  getStorage: () => ApiClient.get<StorageInfo>("/api/users/storage"),

  /**
   * Tìm user theo email
   */
  findByEmail: (email: string) =>
    ApiClient.get<User>(`/api/users/email/${encodeURIComponent(email)}`),

  /**
   * Tìm user theo wallet address
   */
  findByWallet: (walletAddress: string) =>
    ApiClient.get<User>(`/api/users/wallet/${walletAddress}`),
};
