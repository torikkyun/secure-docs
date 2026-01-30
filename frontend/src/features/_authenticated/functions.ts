import { API_URL } from '@/lib/api'
import { useAppSession } from '@/utils/session'
import { getHeaders } from '@/utils/get-header'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const queryUserSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  return { success: true }
})

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const accessToken = session.data.accessToken

    if (!accessToken) {
      await session.clear()
      throw redirect({ to: '/login' })
    }

    const res = await fetch(`${API_URL}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!res.ok) {
      const error = await res.json()
      if (error.statusCode === 401) {
        await session.clear()
        throw redirect({ to: '/login' })
      }
      throw new Error(error.message)
    }

    const data = await res.json()
    return data
  },
)

export const getUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(queryUserSchema)
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())
    if (data.search) params.append('search', data.search)

    const res = await fetch(`${API_URL}/users?${params.toString()}`, {
      headers,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải danh sách users')
    }

    return res.json()
  })

export const getUserByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/users/${data.userId}`, {
      headers,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Lỗi tải thông tin user')
    }

    return res.json()
  })
