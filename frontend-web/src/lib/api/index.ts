import type {
  AccessGrant,
  DashboardStats,
  Download,
  File,
  StorageInfo,
  User,
} from "@/types/api";
import { ApiClient } from "./client";

// User APIs
export const userApi = {
  getProfile: () => ApiClient.get<User>("/api/users/profile"),

  updateProfile: (data: { username?: string; email?: string }) =>
    ApiClient.patch<User>("/api/users/profile", data),

  getStorage: () => ApiClient.get<StorageInfo>("/api/users/storage"),
};

// File APIs
export const fileApi = {
  findAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    sort?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) {
      query.append("page", String(params.page));
    }
    if (params?.limit) {
      query.append("limit", String(params.limit));
    }
    if (params?.type) {
      query.append("type", params.type);
    }
    if (params?.sort) {
      query.append("sort", params.sort);
    }
    if (params?.search) {
      query.append("search", params.search);
    }

    return ApiClient.get<{
      files: File[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/files?${query.toString()}`);
  },

  findOne: (id: string) =>
    ApiClient.get<{ file: File; isOwner: boolean }>(`/api/files/${id}`),

  prepareUpload: (data: {
    fileName: string;
    fileSize: number;
    fileType?: string;
  }) =>
    ApiClient.post<{
      canUpload: boolean;
      message?: string;
      remainingStorage?: string;
      uploadId?: string;
    }>("/api/files/prepare-upload", data),

  upload: (data: {
    file: globalThis.File; // Use browser File type
    encryptedKeyOwner: string;
  }) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("encryptedKeyOwner", data.encryptedKeyOwner);
    return ApiClient.post<File>("/api/files/upload", formData);
  },

  delete: (id: string) =>
    ApiClient.delete<{ message: string }>(`/api/files/${id}`),
};

// Access Grant APIs
export const accessGrantApi = {
  findAll: (params?: { type?: "given" | "received"; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.type) {
      query.append("type", params.type);
    }
    if (params?.page) {
      query.append("page", String(params.page));
    }

    return ApiClient.get<{
      grants: AccessGrant[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/access-grants?${query.toString()}`);
  },

  findOne: (id: string) =>
    ApiClient.get<AccessGrant>(`/api/access-grants/${id}`),

  create: (data: {
    fileId: string;
    granteeEmail: string;
    encryptedKeyGrantee: string;
    expiresAt?: string;
    passcode: string;
  }) =>
    ApiClient.post<{
      grantId: string;
      grant: AccessGrant;
      message: string;
    }>("/api/access-grants", data),

  revoke: (id: string, data: { revokeReason?: string }) =>
    ApiClient.post<{ message: string }>(
      `/api/access-grants/${id}/revoke`,
      data,
    ),
};

// Download APIs
export const downloadApi = {
  findAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) {
      query.append("page", String(params.page));
    }
    if (params?.limit) {
      query.append("limit", String(params.limit));
    }

    return ApiClient.get<{
      downloads: Download[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/downloads?${query.toString()}`);
  },

  request: (fileId: string) =>
    ApiClient.post<{
      downloadId: string;
      encryptedKey: string;
      ownerPublicKey: string;
      fileName: string;
      originalFileName: string;
      fileType: string;
    }>("/api/downloads/request", { fileId }),

  complete: (downloadId: string, success: boolean, errorMessage?: string) =>
    ApiClient.post<{ message: string }>(
      `/api/downloads/${downloadId}/complete`,
      { success, errorMessage },
    ),
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const [filesRes, grantsGivenRes, grantsReceivedRes, storageRes] =
      await Promise.all([
        fileApi.findAll({ limit: 1 }),
        accessGrantApi.findAll({ type: "given", page: 1 }),
        accessGrantApi.findAll({ type: "received", page: 1 }),
        userApi.getStorage(),
      ]);

    return {
      totalFiles: filesRes.pagination.total || 0,
      filesReceived: grantsReceivedRes.pagination.total || 0,
      activeShares: grantsGivenRes.pagination.total || 0,
      storageInfo: storageRes,
    };
  },

  getRecentFiles: (limit = 4) =>
    fileApi.findAll({ limit, sort: "-uploadTimestamp" }),

  getRecentDownloads: (limit = 5) => downloadApi.findAll({ limit }),
};
