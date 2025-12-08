/**
 * Refactored useUpload Hook
 * Chỉ quản lý state, delegate logic cho service
 */

import { useState } from "react";
import {
  checkUploadQuota,
  type UploadOptions,
  type UploadProgress,
  type UploadResult,
  uploadFile,
} from "@/services/file/upload.service";

export type UseUploadReturn = {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadFile: (file: File, options: UploadOptions) => Promise<UploadResult>;
  checkQuota: (fileSize: number) => Promise<{
    canUpload: boolean;
    message?: string;
    remainingStorage?: string;
  }>;
  reset: () => void;
};

/**
 * Hook để xử lý file upload
 * Sử dụng upload service để tách biệt logic
 */
export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await uploadFile(file, {
        ...options,
        onProgress: (p) => {
          setProgress(p);
          options.onProgress?.(p);
        },
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckQuota = async (fileSize: number) => {
    try {
      return await checkUploadQuota(fileSize);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check quota";
      setError(errorMessage);
      throw err;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  };

  return {
    isUploading,
    progress,
    error,
    uploadFile: handleUpload,
    checkQuota: handleCheckQuota,
    reset,
  };
}
