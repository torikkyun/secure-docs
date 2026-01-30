export type FileData = {
  id: string
  filename: string
  filePath: string
  mimeType: string
  size: string | number
  wrappedAesKey: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  enableBlockchainLogging: boolean
  ownerId: string
  isOwner?: boolean
  sharedBy?: {
    id: string
    name: string
    email: string
  } | null
}

export type FileItem = FileData

export type UploadFileResult = FileData

export type GetFilesResult = FileData[]

export type DownloadFileInfo = {
  fileId: string
  filename: string
  mimeType: string
  size: number
  wrappedAesKey: string
  encryptedData?: string
}

export type ShareFileResult = {
  message: string
  shareCount: number
  warnings?: string[]
}
