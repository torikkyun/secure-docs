import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import { FileActivitiesResult } from './types'
import { queryFileActivitySchema, getFileActivitiesSchema } from './schemas'

export const getUserFileActivitiesFn = createServerFn({ method: 'GET' })
  .inputValidator(queryFileActivitySchema)
  .handler(async ({ data }): Promise<FileActivitiesResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()

    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())

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
  })

export const getFileActivitiesFn = createServerFn({ method: 'GET' })
  .inputValidator(getFileActivitiesSchema)
  .handler(async ({ data }): Promise<FileActivitiesResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()

    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())

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
  })
