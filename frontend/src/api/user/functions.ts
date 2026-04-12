import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import {
  UserProfile,
  UpdateProfileResult,
  UsersListResult,
  UserDetailResult,
} from './types'
import {
  updateProfileSchema,
  queryUserSchema,
  getUserByIdSchema,
  uploadAvatarSchema,
} from './schemas'
import { useAppSession } from '@/utils/session'
import { redirect } from '@tanstack/react-router'

export const getProfileFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<UserProfile> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  },
)

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }): Promise<UpdateProfileResult> => {
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

export const uploadAvatarFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadAvatarSchema)
  .handler(async ({ data }): Promise<{ id: string; avatar: string }> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      headers,
      body: data,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })

export const getUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(queryUserSchema)
  .handler(async ({ data }): Promise<UsersListResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()

    if (data.page) params.append('page', data.page.toString())
    if (data.limit) params.append('limit', data.limit.toString())
    if (data.search) params.append('search', data.search)

    const url = `${API_URL}/users${params.toString() ? `?${params.toString()}` : ''}`

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

export const getUserByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getUserByIdSchema)
  .handler(async ({ data }): Promise<UserDetailResult> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/users/${data.userId}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
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
