import { createServerFn } from '@tanstack/react-start'
import {
  deleteFileSchema,
  getFileSchema,
  shareFileSchema,
  uploadFileSchema,
} from './schemas'
import { API_URL } from '@/lib/api'
import { getHeaders } from '@/utils/get-header'

export const uploadFileFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadFileSchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    // data is FormData
    const res = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        ...headers,
        // Content-Type header not set manually for FormData to let browser/node set boundary
      },
      body: data,
    })

    console.log('uploadFileFn res', res)

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })

export const getUserFilesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    const data = await res.json()

    return data
  },
)

export const getFileFn = createServerFn({ method: 'GET' })
  .inputValidator(getFileSchema)
  .handler(async ({ data: fileId }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })

export const downloadFileFn = createServerFn({ method: 'GET' })
  .inputValidator(getFileSchema)
  .handler(async ({ data: fileId }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })

export const deleteFileFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteFileSchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files/${data.fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return { success: true }
  })

export const shareFileFn = createServerFn({ method: 'POST' })
  .inputValidator(shareFileSchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })

export const downloadFileStreamFn = createServerFn({ method: 'GET' })
  .inputValidator(getFileSchema)
  .handler(async ({ data: fileId }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files/${fileId}/stream`, {
      method: 'GET',
      headers: {
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: 'Không thể tải file từ server',
      }))
      throw new Error(error.message)
    }

    const arrayBuffer = await res.arrayBuffer()
    // Convert ArrayBuffer to base64 string for serialization
    const bytes = new Uint8Array(arrayBuffer)
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
      '',
    )
    return btoa(binary)
  })
