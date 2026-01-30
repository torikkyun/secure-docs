import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '@/lib/api'
import { getHeaders } from '@/utils/get-header'

// Get dashboard statistics
export const getDashboardStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải thống kê dashboard')
    }

    const data = await res.json()
    return data
  },
)

// Get recent activities for dashboard
export const getRecentActivitiesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/file-activity/recent?limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải hoạt động gần đây')
    }

    const data = await res.json()
    return data
  },
)

// Get recent files for dashboard
export const getRecentFilesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/files/recent?limit=8`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải files gần đây')
    }

    const data = await res.json()
    return data
  },
)