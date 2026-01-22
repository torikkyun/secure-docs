import type { DashboardStats } from "@/types/api";
import { downloadService } from "./download.service";
import { fileService } from "./file.service";
import { shareService } from "./share.service";
import { userService } from "./user.service";

/**
 * Dashboard Service - Tập hợp các API calls cho dashboard
 */
export const dashboardService = {
  /**
   * Lấy tất cả stats cho dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    const [filesRes, grantsGivenRes, grantsReceivedRes, storageRes] =
      await Promise.all([
        fileService.findAll({ limit: 1 }),
        shareService.findAll({ type: "given", page: 1 }),
        shareService.findAll({ type: "received", page: 1 }),
        userService.getStorage(),
      ]);

    return {
      totalFiles: filesRes.pagination.total || 0,
      filesReceived: grantsReceivedRes.pagination.total || 0,
      activeShares: grantsGivenRes.pagination.total || 0,
      storageInfo: storageRes,
    };
  },

  /**
   * Lấy files gần đây
   */
  getRecentFiles: (limit = 4) =>
    fileService.findAll({ limit, sort: "-uploadTimestamp" }),

  /**
   * Lấy downloads gần đây
   */
  getRecentDownloads: (limit = 5) => downloadService.findAll({ limit }),
};
