import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import { GroupItem, GroupDetail, GroupListResult } from './types'
import type { z } from 'zod'
import {
  createGroupSchema,
  updateGroupSchema,
  addGroupMemberSchema,
  removeGroupMemberSchema,
  deleteGroupSchema,
  queryGroupSchema,
  getGroupByIdSchema,
} from './schemas'

export const createGroupFn = async ({
  data,
}: {
  data: z.infer<typeof createGroupSchema>
}): Promise<GroupItem> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const getGroupsFn = async ({
  data,
}: {
  data: z.infer<typeof queryGroupSchema>
}): Promise<GroupListResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()
  if (data.page) params.set('page', String(data.page))
  if (data.limit) params.set('limit', String(data.limit))
  if (data.search) params.set('search', data.search)
  if (data.memberId) params.set('memberId', data.memberId)
  const res = await fetch(`${API_URL}/groups?${params.toString()}`, { headers })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const getGroupByIdFn = async ({
  data,
}: {
  data: z.infer<typeof getGroupByIdSchema>
}): Promise<GroupDetail> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/groups/${data.id}`, { headers })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const updateGroupFn = async ({
  data,
}: {
  data: z.infer<typeof updateGroupSchema>
}): Promise<GroupItem> => {
  const { id, ...body } = data
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/groups/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const deleteGroupFn = async ({
  data,
}: {
  data: z.infer<typeof deleteGroupSchema>
}): Promise<{ message: string }> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/groups/${data.id}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const addGroupMemberFn = async ({
  data,
}: {
  data: z.infer<typeof addGroupMemberSchema>
}): Promise<{ message: string }> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/groups/${data.groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ userId: data.userId }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const removeGroupMemberFn = async ({
  data,
}: {
  data: z.infer<typeof removeGroupMemberSchema>
}): Promise<{ message: string }> => {
  const headers = await getHeaders()
  const res = await fetch(
    `${API_URL}/groups/${data.groupId}/members/${data.memberId}`,
    { method: 'DELETE', headers },
  )
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}
