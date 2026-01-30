export type FileActivityType =
  | 'UPLOAD'
  | 'SHARE'
  | 'DOWNLOAD'
  | 'DELETE'
  | 'REVOKE_SHARE'

export type FileActivity = {
  id: string
  activityType: FileActivityType
  timestamp: string
  userId: string
  fileId: string
  metadata?: {
    // SHARE specific
    recipients?: Array<{
      id: string
      name: string
      email: string
    }>
    shareCount?: number
    warnings?: string[]
    // DOWNLOAD specific
    downloadedBy?: {
      id: string
      name: string
      email: string
    }
    // UPLOAD specific
    filename?: string
    mimeType?: string
    size?: number
  }
  user?: {
    id: string
    name: string
    email: string
  }
  file?: {
    id: string
    filename: string
    mimeType: string
    size: number
  }
  blockchainTxHash?: string | null
}

export type PaginatedFileActivities = {
  data: FileActivity[]
  total: number
  page: number
  limit: number
  totalPages: number
  blockchainTxHash?: string | null
}
