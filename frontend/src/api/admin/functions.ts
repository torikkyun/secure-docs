import { createServerFn } from '@tanstack/react-start'
import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import {
  AdminUsersResult,
  AlertsResult,
  UnresolvedAlertCount,
  UserDetailResult,
  AdminUser,
  AnomalyAlert,
} from './types'
import {
  queryAdminUsersSchema,
  updateUserRoleSchema,
  banUserSchema,
  queryAlertsSchema,
  resolveAlertSchema,
  getAdminUserDetailSchema,
} from './schemas'

export const getAdminUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(queryAdminUsersSchema)
  .handler(async ({ data }): Promise<AdminUsersResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.set('page', String(data.page))
    if (data.limit) params.set('limit', String(data.limit))
    if (data.search) params.set('search', data.search)
    const res = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
      headers,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const getAdminUserDetailFn = createServerFn({ method: 'GET' })
  .inputValidator(getAdminUserDetailSchema)
  .handler(async ({ data }): Promise<UserDetailResult> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/admin/users/${data.userId}`, {
      headers,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const updateUserRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(updateUserRoleSchema)
  .handler(async ({ data }): Promise<AdminUser> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/admin/users/${data.userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ role: data.role }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const banUserFn = createServerFn({ method: 'POST' })
  .inputValidator(banUserSchema)
  .handler(async ({ data }): Promise<AdminUser> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/admin/users/${data.userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ isBanned: data.isBanned }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const getAlertsFn = createServerFn({ method: 'GET' })
  .inputValidator(queryAlertsSchema)
  .handler(async ({ data }): Promise<AlertsResult> => {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (data.page) params.set('page', String(data.page))
    if (data.limit) params.set('limit', String(data.limit))
    if (data.level) params.set('level', data.level)
    if (data.type) params.set('type', data.type)
    if (data.isResolved !== undefined)
      params.set('isResolved', String(data.isResolved))
    if (data.userId) params.set('userId', data.userId)
    const res = await fetch(`${API_URL}/admin/alerts?${params.toString()}`, {
      headers,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })

export const getUnresolvedAlertCountFn = createServerFn({
  method: 'GET',
}).handler(async (): Promise<UnresolvedAlertCount> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/admin/alerts/unresolved-count`, {
    headers,
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
})

export const resolveAlertFn = createServerFn({ method: 'POST' })
  .inputValidator(resolveAlertSchema)
  .handler(async ({ data }): Promise<AnomalyAlert> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/admin/alerts/${data.alertId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ isResolved: data.isResolved }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  })
