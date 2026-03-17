export type FileOwner = {
  id: string
  name: string
  email: string
  publicKey: string
  avatar: string
}

export type FileShare = {
  id: string
  wrappedAesKey: string
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    avatar: string
  }
  recipient: {
    id: string
    name: string
    email: string
    avatar: string
  }
}

export type FileItem = {
  id: string
  filename: string
  mimeType: string
  size: string
  wrappedAesKey: string
  createdAt: string
  updatedAt: string
  ownerId: string
  owner: FileOwner
  isOwner: boolean
  sharedBy: FileOwner | null
  shares?: FileShare[]
  sharedWith?: { id: string; name: string; email: string; avatar: string }[]
}

export type UploadFileResult = {
  id: string
  filename: string
  mimeType: string
  size: string
  createdAt: string
}

export type FilesListResult = {
  files: FileItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type FileDetailResult = {
  id: string
  filename: string
  mimeType: string
  size: string
  createdAt: string
  updatedAt: string
  isOwner: boolean
  wrappedAesKey: string
  owner: FileOwner
  sharedWith?: FileOwner[]
}

export type FileDownloadResult = {
  id: string
  filename: string
  mimeType: string
  size: string
  owner: FileOwner
  isOwner: boolean
  wrappedAesKey: string
}

export type DeleteFileResult = {
  message: string
}
