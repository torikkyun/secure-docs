import { ApiClient } from "@/lib/api/client";
import type { Download } from "@/types/api";

export type DownloadListParams = {
  page?: number;
  limit?: number;
};

export type DownloadListResponse = {
  downloads: Download[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DownloadRequestResponse = {
  downloadId: string;
  decryptedKey: string;
  cid: string;
};

/**
 * Download Service - Quản lý các API liên quan đến download
 */
export const downloadService = {
  /**
   * Lấy danh sách download history
   */
  findAll: (params?: DownloadListParams) => {
    const query = new URLSearchParams();
    if (params?.page) {
      query.append("page", String(params.page));
    }
    if (params?.limit) {
      query.append("limit", String(params.limit));
    }

    return ApiClient.get<DownloadListResponse>(
      `/api/downloads?${query.toString()}`
    );
  },

  /**
   * Request download - lấy thông tin để download file
   */
  request: (fileId: string) =>
    ApiClient.post<DownloadRequestResponse>("/api/downloads/request", {
      fileId,
    }),

  /**
   * Complete download - báo cáo kết quả download
   */
  complete: (downloadId: string, success: boolean, errorMessage?: string) =>
    ApiClient.post<{ message: string }>(
      `/api/downloads/${downloadId}/complete`,
      { success, errorMessage }
    ),
};
