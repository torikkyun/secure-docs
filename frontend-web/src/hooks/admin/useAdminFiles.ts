"use client";

import { useEffect, useState } from "react";

export type AdminFile = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  cid: string;
  createdAt: string;
  status: {
    name: string;
  };
  owner?: {
    username: string;
    email: string;
    walletAddress: string;
  };
};

export type AdminFilesResponse = {
  files: AdminFile[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Hook để fetch files với admin privileges
 */
export function useAdminFiles(token: string | null, limit = 100) {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/files?limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data: { data: AdminFilesResponse } = await response.json();
        setFiles(data.data.files);
        setTotal(data.data.total);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [token, limit]);

  return { files, total, loading, error };
}
