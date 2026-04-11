import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import { CreateShareResult, RevokeShareResult } from './types'
import {
  createShareSchema,
  revokeShareSchema,
  createGroupShareSchema,
} from './schemas'

export const createShareFn = createServerFn({ method: 'POST' })
  .inputValidator(createShareSchema)
  .handler(async ({ data }): Promise<CreateShareResult> => {
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

export const createGroupShareFn = createServerFn({ method: 'POST' })
  .inputValidator(createGroupShareSchema)
  .handler(async ({ data }): Promise<CreateShareResult> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/shares/group`, {
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

export const revokeShareFn = createServerFn({ method: 'POST' })
  .inputValidator(revokeShareSchema)
  .handler(async ({ data }): Promise<RevokeShareResult> => {
    const headers = await getHeaders()
    const res = await fetch(
      `${API_URL}/shares/${data.fileId}/revoke/${data.recipientId}`,
      {
        method: 'DELETE',
        headers,
      },
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })
