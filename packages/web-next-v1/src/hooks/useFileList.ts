/**
 * Refactored useFiles Hook
 * Sử dụng service layer và chuẩn hóa state management
 */

import { useCallback, useEffect, useState } from "react";
import { type FileListParams, fileService } from "@/services/api/file.service";
import type { File } from "@/types/api";

export type UseFilesOptions = FileListParams;

export type UseFilesReturn = {
  files: File[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: (newParams?: FileListParams) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
};

/**
 * Hook để quản lý danh sách files
 */
export function useFiles(initialParams?: UseFilesOptions): UseFilesReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchFiles = useCallback(
    async (newParams?: FileListParams) => {
      try {
        setLoading(true);
        setError(null);

        const params = { ...initialParams, ...newParams };
        const response = await fileService.findAll(params);

        setFiles(response.files);
        setPagination(response.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch files";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [initialParams]
  );

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (fileId: string) => {
    try {
      await fileService.delete(fileId);
      await fetchFiles(); // Refresh list sau khi delete
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete file";
      throw new Error(errorMessage);
    }
  };

  return {
    files,
    loading,
    error,
    pagination,
    refetch: fetchFiles,
    deleteFile,
  };
}
