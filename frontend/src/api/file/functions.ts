import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import {
  UploadFileResult,
  FilesListResult,
  FileDetailResult,
  FileDownloadResult,
  DeleteFileResult,
} from './types'
import type { z } from 'zod'
import { queryFileSchema, getFileByIdSchema, deleteFileSchema } from './schemas'

export const uploadFilesFn = async ({
  data,
}: {
  data: FormData
}): Promise<UploadFileResult[]> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    headers: {
      ...headers,
      // Do not set Content-Type for FormData; browser sets it with boundary
    },
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}

export const getFilesFn = async ({
  data,
}: {
  data: z.infer<typeof queryFileSchema>
}): Promise<FilesListResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()

  if (data.page) params.append('page', data.page.toString())
  if (data.limit) params.append('limit', data.limit.toString())
  if (data.search) params.append('search', data.search)
  if (data.filter) params.append('filter', data.filter)
  if (data.sortBy) params.append('sortBy', data.sortBy)
  if (data.sortOrder) params.append('sortOrder', data.sortOrder)
  if (data.fileType) params.append('fileType', data.fileType)
  if (data.ownerId) params.append('ownerId', data.ownerId)
  if (data.sharedWithId) params.append('sharedWithId', data.sharedWithId)
  if (data.classification) params.append('classification', data.classification)

  const url = `${API_URL}/files${params.toString() ? `?${params.toString()}` : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}

export const getFileByIdFn = async ({
  data,
}: {
  data: z.infer<typeof getFileByIdSchema>
}): Promise<FileDetailResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/${data.fileId}`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}

export const getFileForDownloadFn = async ({
  data,
}: {
  data: z.infer<typeof getFileByIdSchema>
}): Promise<FileDownloadResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/${data.fileId}/download`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}

export const downloadFileStreamFn = async ({
  data,
}: {
  data: z.infer<typeof getFileByIdSchema>
}): Promise<{ blob: string; filename: string }> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/${data.fileId}/stream`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  // Lấy filename từ Content-Disposition header
  const contentDisposition = res.headers.get('Content-Disposition')
  let filename = 'download'

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1])
    }
  }

  const arrayBuffer = await res.arrayBuffer()
  // Convert ArrayBuffer to base64 string for serialization
  const bytes = new Uint8Array(arrayBuffer)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  const blob = btoa(binary)

  return { blob, filename }
}

export const viewFileStreamFn = async ({
  data,
}: {
  data: z.infer<typeof getFileByIdSchema>
}): Promise<{ blob: string; filename: string }> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/${data.fileId}/view`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  const contentDisposition = res.headers.get('Content-Disposition')
  let filename = 'file'

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1])
    }
  }

  const arrayBuffer = await res.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  const blob = btoa(binary)

  return { blob, filename }
}

export const deleteFileFn = async ({
  data,
}: {
  data: z.infer<typeof deleteFileSchema>
}): Promise<DeleteFileResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/files/${data.fileId}`, {
    method: 'DELETE',
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}
