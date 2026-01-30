import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '@/lib/api'
import { getHeaders } from '@/utils/get-header'

// Get shared files for current user
export const getSharedFilesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files?filter=shared&limit=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải files được chia sẻ')
    }

    const data = await res.json()
    return data
  },
)
