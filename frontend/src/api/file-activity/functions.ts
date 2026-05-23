import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import { FileActivitiesResult } from './types'
import type { z } from 'zod'
import { queryFileActivitySchema, getFileActivitiesSchema } from './schemas'

export const getUserFileActivitiesFn = async ({
  data,
}: {
  data: z.infer<typeof queryFileActivitySchema>
}): Promise<FileActivitiesResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()

  if (data.page) params.append('page', data.page.toString())
  if (data.limit) params.append('limit', data.limit.toString())
  if (data.action) params.append('action', data.action)
  if (data.startDate) params.append('startDate', data.startDate)
  if (data.endDate) params.append('endDate', data.endDate)

  const url = `${API_URL}/file-activity/user${
    params.toString() ? `?${params.toString()}` : ''
  }`

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

export const getFileActivitiesFn = async ({
  data,
}: {
  data: z.infer<typeof getFileActivitiesSchema>
}): Promise<FileActivitiesResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()

  if (data.page) params.append('page', data.page.toString())
  if (data.limit) params.append('limit', data.limit.toString())
  if (data.startDate) params.append('startDate', data.startDate)
  if (data.endDate) params.append('endDate', data.endDate)

  const url = `${API_URL}/file-activity/file/${data.fileId}${
    params.toString() ? `?${params.toString()}` : ''
  }`

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
