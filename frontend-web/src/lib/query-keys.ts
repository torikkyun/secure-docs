/**
 * Query Keys for React Query / Data Fetching
 * Chuẩn hóa cache keys để dễ invalidate và manage
 */

export const QUERY_KEYS = {
  // User
  user: {
    all: ["user"] as const,
    profile: () => [...QUERY_KEYS.user.all, "profile"] as const,
    storage: () => [...QUERY_KEYS.user.all, "storage"] as const,
  },

  // Files
  files: {
    all: ["files"] as const,
    lists: () => [...QUERY_KEYS.files.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.files.lists(), filters] as const,
    details: () => [...QUERY_KEYS.files.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.files.details(), id] as const,
    recent: () => [...QUERY_KEYS.files.all, "recent"] as const,
  },

  // Shares
  shares: {
    all: ["shares"] as const,
    lists: () => [...QUERY_KEYS.shares.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.shares.lists(), filters] as const,
    details: () => [...QUERY_KEYS.shares.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.shares.details(), id] as const,
  },

  // Downloads
  downloads: {
    all: ["downloads"] as const,
    lists: () => [...QUERY_KEYS.downloads.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.downloads.lists(), filters] as const,
    recent: () => [...QUERY_KEYS.downloads.all, "recent"] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...QUERY_KEYS.dashboard.all, "stats"] as const,
    recentFiles: () => [...QUERY_KEYS.dashboard.all, "recentFiles"] as const,
    recentDownloads: () =>
      [...QUERY_KEYS.dashboard.all, "recentDownloads"] as const,
  },
} as const;
