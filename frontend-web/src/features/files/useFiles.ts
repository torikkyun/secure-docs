import { useCallback, useEffect, useState } from "react";
import { type FileListParams, fileService } from "@/services/api/file.service";
import type { File } from "@/types/api";

/**
 * Hook để quản lý danh sách files
 */
export function useFiles(params?: FileListParams) {
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
        const response = await fileService.findAll({
          ...params,
          ...newParams,
        });
        setFiles(response.files);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch files");
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (fileId: string) => {
    try {
      await fileService.delete(fileId);
      await fetchFiles(); // Refresh list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete file"
      );
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
