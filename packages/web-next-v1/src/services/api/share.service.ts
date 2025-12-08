import { ApiClient } from "@/lib/api/client";
import type { AccessGrant } from "@/types/api";

export type ShareListParams = {
  type?: "given" | "received";
  page?: number;
};

export type ShareListResponse = {
  grants: AccessGrant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateShareData = {
  fileId: string;
  granteeWalletAddress: string;
  encryptedKeyGrantee: string;
  txHash: string;
  signature: string;
  expiresAt?: string;
};

export type RevokeShareData = {
  message: string; // SIWE message string
  signature: string; // Signature of the message
  reason?: string; // Optional reason for revoke
};

/**
 * Share Service - Quản lý các API liên quan đến chia sẻ file
 */
export const shareService = {
  /**
   * Lấy danh sách shares (given hoặc received)
   */
  findAll: (params?: ShareListParams) => {
    const query = new URLSearchParams();
    if (params?.type) {
      query.append("type", params.type);
    }
    if (params?.page) {
      query.append("page", String(params.page));
    }

    return ApiClient.get<ShareListResponse>(
      `/api/access-grants?${query.toString()}`
    );
  },

  /**
   * Lấy chi tiết một share
   */
  findOne: (id: string) =>
    ApiClient.get<AccessGrant>(`/api/access-grants/${id}`),

  /**
   * Tạo share mới
   */
  create: (data: CreateShareData) =>
    ApiClient.post<AccessGrant>("/api/access-grants", data),

  /**
   * Revoke share
   */
  revoke: (id: string, data: RevokeShareData) =>
    ApiClient.post<{ message: string }>(
      `/api/access-grants/${id}/revoke`,
      data
    ),
};
