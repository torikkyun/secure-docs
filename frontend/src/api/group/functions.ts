import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import { GroupItem, GroupDetail, GroupListResult } from './types'
import {
  createGroupSchema,
  updateGroupSchema,
  addGroupMemberSchema,
  removeGroupMemberSchema,
  deleteGroupSchema,
  queryGroupSchema,
  getGroupByIdSchema,
} from './schemas'

export const createGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(createGroupSchema)
  .handler(async ({ data }): Promise<GroupItem> => {
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
  })

export const getGroupsFn = createServerFn({ method: 'GET' })
  .inputValidator(queryGroupSchema)
  .handler(async ({ data }): Promise<GroupListResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.set('page', String(data.page))
    if (data.limit) params.set('limit', String(data.limit))
    if (data.search) params.set('search', data.search)
    if (data.memberId) params.set('memberId', data.memberId)
    const res = await fetch(`${API_URL}/groups?${params.toString()}`, {
      headers,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const getGroupByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getGroupByIdSchema)
  .handler(async ({ data }): Promise<GroupDetail> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/groups/${data.id}`, { headers })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const updateGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(updateGroupSchema)
  .handler(async ({ data }): Promise<GroupItem> => {
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
  })

export const deleteGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteGroupSchema)
  .handler(async ({ data }): Promise<{ message: string }> => {
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
  })

export const addGroupMemberFn = createServerFn({ method: 'POST' })
  .inputValidator(addGroupMemberSchema)
  .handler(async ({ data }): Promise<{ message: string }> => {
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
  })

export const removeGroupMemberFn = createServerFn({ method: 'POST' })
  .inputValidator(removeGroupMemberSchema)
  .handler(async ({ data }): Promise<{ message: string }> => {
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
  })
