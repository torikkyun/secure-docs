/**
 * Refactored useDashboard Hook
 * Lấy dashboard stats và recent data
 */

import { useCallback, useEffect, useState } from "react";
import { fileService } from "@/services/api/file.service";
import { shareService } from "@/services/api/share.service";
import { userService } from "@/services/api/user.service";
import type { File } from "@/types/api";
import type { DashboardStats } from "@/types/dashboard";

export type UseDashboardStatsReturn = {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type UseRecentFilesReturn = {
  files: File[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Hook để lấy dashboard statistics
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tất cả data cần thiết parallel
      const [filesRes, grantsGivenRes, storageRes] = await Promise.all([
        fileService.findAll({ limit: 1 }),
        shareService.findAll({ type: "given", page: 1 }),
        userService.getStorage(),
      ]);

      setStats({
        totalFiles: filesRes.pagination.total || 0,
        totalSize: 0, // TODO: Calculate from files
        storageUsed: storageRes.storageUsed || 0,
        storageLimit: storageRes.storageLimit || 0,
        sharedFiles: grantsGivenRes.pagination.total || 0,
        recentDownloads: 0, // TODO: Get from downloads API
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch stats";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook để lấy recent files
 */
export function useRecentFiles(limit = 4): UseRecentFilesReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fileService.findAll({
        limit,
        sort: "-uploadTimestamp",
      });

      setFiles(response.files);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch recent files";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  return {
    files,
    loading,
    error,
    refetch: fetchRecentFiles,
  };
}
