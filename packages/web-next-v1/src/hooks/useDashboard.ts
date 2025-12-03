"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats, File } from "@/types/api";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useRecentFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getRecentFiles(8);
        setFiles(response.files || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch files");
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  return { files, loading, error, refetch: () => setFiles([]) };
}
