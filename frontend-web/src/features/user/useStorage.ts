import { useEffect, useState } from "react";
import { userService } from "@/services/api/user.service";
import type { StorageInfo } from "@/types/api";

/**
 * Hook để lấy và quản lý thông tin storage
 */
export function useStorage() {
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStorage = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getStorage();
      setStorage(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching storage:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch storage")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  // Calculated values
  const storageUsed = storage?.storageUsed ?? 0;
  const storageLimit = storage?.storageLimit ?? 0;
  const usagePercentage =
    storage && storageLimit > 0
      ? Math.round((storageUsed / storageLimit) * 100)
      : 0;
  const storageAvailable =
    storage && storageLimit - storageUsed >= 0 ? storageLimit - storageUsed : 0;

  return {
    storage,
    storageUsed,
    storageLimit,
    usagePercentage,
    storageAvailable,
    isLoading,
    error,
    refetch: fetchStorage,
  };
}
