import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { API_URL } from '@/lib/api'
import { getHeaders } from '@/utils/get-header'

const queryFileActivitySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
})

export const getUserFileActivitiesFn = createServerFn({ method: 'GET' })
  .inputValidator(queryFileActivitySchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())

    const res = await fetch(
      `${API_URL}/file-activity/user?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải hoạt động file')
    }

    return res.json()
  })

export const getFileActivitiesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      fileId: z.string(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())

    const res = await fetch(
      `${API_URL}/file-activity/file/${data.fileId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải hoạt động file')
    }

    return res.json()
  })
