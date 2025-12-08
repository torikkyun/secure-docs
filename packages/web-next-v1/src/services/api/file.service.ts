import { ApiClient } from "@/lib/api/client";
import type { File } from "@/types/api";

export type FileListParams = {
  page?: number;
  limit?: number;
  type?: string;
  sort?: string;
  search?: string;
};

export type FileListResponse = {
  files: File[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type FileUploadData = {
  fileHash: string;
  cid: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  encryptedKeyOwner: string;
  pinSize: number;
  pinService: string;
};

/**
 * File Service - Quản lý các API liên quan đến files
 */
export const fileService = {
  /**
   * Lấy danh sách files với filters và pagination
   */
  findAll: (params?: FileListParams) => {
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

    return ApiClient.get<FileListResponse>(`/api/files?${query.toString()}`);
  },

  /**
   * Lấy chi tiết một file
   */
  findOne: (id: string) =>
    ApiClient.get<{ file: File; isOwner: boolean }>(`/api/files/${id}`),

  /**
   * Chuẩn bị upload file - kiểm tra quota
   */
  prepareUpload: (fileSize: number) =>
    ApiClient.post<{
      canUpload: boolean;
      message?: string;
      remainingStorage?: string;
      uploadId?: string;
    }>("/api/files/prepare-upload", { fileSize }),

  /**
   * Upload file metadata sau khi đã upload lên IPFS
   */
  upload: (data: FileUploadData) =>
    ApiClient.post<File>("/api/files/upload", data),

  /**
   * Xóa file
   */
  delete: (id: string) =>
    ApiClient.delete<{ message: string }>(`/api/files/${id}`),

  /**
   * Lấy files gần đây
   */
  getRecent: (limit = 4) =>
    fileService.findAll({ limit, sort: "-uploadTimestamp" }),
};
