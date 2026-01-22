import { useCallback, useEffect, useState } from "react";
import {
  type ShareListParams,
  shareService,
} from "@/services/api/share.service";
import type { AccessGrant } from "@/types/api";

/**
 * Hook để quản lý danh sách shares
 */
export function useShares(params?: ShareListParams) {
  const [shares, setShares] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchShares = useCallback(
    async (newParams?: ShareListParams) => {
      try {
        setLoading(true);
        setError(null);
        const response = await shareService.findAll({
          ...params,
          ...newParams,
        });
        setShares(response.grants);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch shares");
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const revokeShare = async (
    shareId: string,
    signature: string,
    reason?: string
  ) => {
    try {
      await shareService.revoke(shareId, {
        revokeSignature: signature,
        revokeReason: reason,
      });
      await fetchShares(); // Refresh list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to revoke share"
      );
    }
  };

  return {
    shares,
    loading,
    error,
    pagination,
    refetch: fetchShares,
    revokeShare,
  };
}
