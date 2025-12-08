/**
 * Refactored useDownload Hook
 * Chỉ quản lý state, delegate logic cho service
 */

import { useState } from "react";
import {
  type DownloadOptions,
  type DownloadProgress,
  type DownloadResult,
  downloadAndSaveFile,
  downloadFile,
} from "@/services/file/download.service";

export type UseDownloadReturn = {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
  download: (
    fileId: string,
    options?: DownloadOptions
  ) => Promise<DownloadResult>;
  downloadAndSave: (fileId: string, options?: DownloadOptions) => Promise<void>;
  reset: () => void;
};

/**
 * Hook để xử lý file download
 * Sử dụng download service để tách biệt logic
 */
export function useDownload(): UseDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (
    fileId: string,
    options: DownloadOptions = {}
  ): Promise<DownloadResult> => {
    setIsDownloading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await downloadFile(fileId, {
        ...options,
        onProgress: (p) => {
          setProgress(p);
          options.onProgress?.(p);
        },
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Download failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAndSave = async (
    fileId: string,
    options: DownloadOptions = {}
  ): Promise<void> => {
    setIsDownloading(true);
    setError(null);
    setProgress(null);

    try {
      await downloadAndSaveFile(fileId, {
        ...options,
        onProgress: (p) => {
          setProgress(p);
          options.onProgress?.(p);
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Download failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setIsDownloading(false);
    setProgress(null);
    setError(null);
  };

  return {
    isDownloading,
    progress,
    error,
    download: handleDownload,
    downloadAndSave: handleDownloadAndSave,
    reset,
  };
}
