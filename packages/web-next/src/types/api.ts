export type User = {
  id: string;
  walletAddress: string;
  username: string;
  email: string;
  publicKey: string;
  storageUsed: number;
  storageLimit: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  role: {
    name: string;
  };
};

export type File = {
  id: string;
  ownerId: string;
  fileHash: string;
  cid: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTimestamp: string;
  status: {
    name: string;
  };
  owner?: {
    username: string;
    walletAddress: string;
  };
};

export type AccessGrant = {
  id: string;
  fileId: string;
  grantorId: string;
  granteeId: string;
  txHash: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  status: {
    name: string;
  };
  file?: File;
  grantor?: {
    username: string;
    walletAddress: string;
  };
  grantee?: {
    username: string;
    walletAddress: string;
  };
};

export type Download = {
  id: string;
  fileId: string;
  userId: string;
  downloadTimestamp: string;
  ipAddress: string;
  fileSizeDownloaded: number | null;
  status: {
    name: string;
  };
  file?: File;
  user?: {
    username: string;
  };
};

export type StorageInfo = {
  storageUsed: number;
  storageLimit: number;
  usagePercentage: number;
};

export type DashboardStats = {
  totalFiles: number;
  filesReceived: number;
  activeShares: number;
  storageInfo: StorageInfo;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
