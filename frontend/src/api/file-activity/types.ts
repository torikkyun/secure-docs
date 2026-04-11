export type FileActivityUser = {
  id: string
  name: string
  email: string
  avatar: string | null
}

export type FileActivityFile = {
  id: string
  filename: string
  mimeType: string
}

export type BaseFileActivity = {
  id: string
  action: string
  user: FileActivityUser
  file: FileActivityFile
  blockchainTxHash: string | null
  createdAt: string
  ipAddress: string | null
  userAgent: string | null
}

export type ShareActivity = BaseFileActivity & {
  action: 'SHARE'
  recipients: FileActivityUser[]
  shareCount: number
  warnings?: string[]
}

export type DownloadActivity = BaseFileActivity & {
  action: 'DOWNLOAD'
  downloadedBy: FileActivityUser
  filename: string
}

export type UploadActivity = BaseFileActivity & {
  action: 'UPLOAD'
  filename: string
  mimeType: string
  size: string
}

export type ViewActivity = BaseFileActivity & {
  action: 'VIEW'
  viewedByOwner: boolean
}

export type FileActivity =
  | ShareActivity
  | DownloadActivity
  | UploadActivity
  | ViewActivity
  | BaseFileActivity

export type FileActivitiesResult = {
  data: FileActivity[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats?: Record<string, number>
}
