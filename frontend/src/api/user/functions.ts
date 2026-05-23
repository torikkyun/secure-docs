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
} from './schemas'
import { redirect } from '@tanstack/react-router'
import type { z } from 'zod'

export const getProfileFn = async (): Promise<UserProfile> => {
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
}

export const updateProfileFn = async ({
  data,
}: {
  data: z.infer<typeof updateProfileSchema>
}): Promise<UpdateProfileResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}

export const uploadAvatarFn = async ({
  data,
}: {
  data: FormData
}): Promise<{ id: string; avatar: string }> => {
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
}

export const getUsersFn = async ({
  data,
}: {
  data: z.infer<typeof queryUserSchema>
}): Promise<UsersListResult> => {
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
}

export const getUserByIdFn = async ({
  data,
}: {
  data: z.infer<typeof getUserByIdSchema>
}): Promise<UserDetailResult> => {
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
}

export const logoutFn = async (): Promise<{ success: boolean }> => {
  localStorage.removeItem('access_token')
  return { success: true }
}

export const getCurrentUserFn = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw redirect({ to: '/login' })
  }

  const res = await fetch(`${API_URL}/users/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    if (error.statusCode === 401) {
      localStorage.removeItem('access_token')
      throw redirect({ to: '/login' })
    }
    throw new Error(error.message)
  }

  return res.json()
}
