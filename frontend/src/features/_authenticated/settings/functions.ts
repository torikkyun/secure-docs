import { createServerFn } from '@tanstack/react-start'
import { updateProfileSchema } from './schemas'
import { API_URL } from '@/lib/api'
import { getHeaders } from '@/utils/get-header'

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
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
