export type FileItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cid: string;
  uploadTimestamp: string;
  status: {
    name: string;
  };
  owner: {
    username: string;
    walletAddress: string;
  };
  grants?: Array<{
    grantee: {
      username: string;
    };
    status: {
      name: string;
    };
  }>;
};

export type DashboardStats = {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageLimit: number;
  sharedFiles: number;
  recentDownloads: number;
};

export type RecentActivity = {
  id: string;
  eventType: string;
  fileName?: string;
  timestamp: string;
  user: {
    username: string;
  };
};

export type StorageInfo = {
  used: number;
  total: number;
  percentage: number;
};
