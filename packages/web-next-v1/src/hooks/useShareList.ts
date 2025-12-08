/**
 * Refactored useShares Hook
 * Quản lý danh sách shares (given/received)
 */

import { useCallback, useEffect, useState } from "react";
import {
  type ShareListParams,
  shareService,
} from "@/services/api/share.service";
import type { AccessGrant } from "@/types/api";

export type UseSharesOptions = ShareListParams;

export type UseSharesReturn = {
  grants: AccessGrant[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: (newParams?: ShareListParams) => Promise<void>;
  revokeShare: (
    grantId: string,
    signature: string,
    reason?: string
  ) => Promise<void>;
};

/**
 * Hook để quản lý shares
 */
export function useShares(initialParams?: UseSharesOptions): UseSharesReturn {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
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

        const params = { ...initialParams, ...newParams };
        const response = await shareService.findAll(params);

        setGrants(response.grants);
        setPagination(response.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch shares";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [initialParams]
  );

  // Initial fetch
  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const revokeShare = async (
    grantId: string,
    signature: string,
    reason?: string
  ) => {
    try {
      await shareService.revoke(grantId, {
        revokeSignature: signature,
        revokeReason: reason,
      });
      await fetchShares(); // Refresh list sau khi revoke
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to revoke share";
      throw new Error(errorMessage);
    }
  };

  return {
    grants,
    loading,
    error,
    pagination,
    refetch: fetchShares,
    revokeShare,
  };
}
