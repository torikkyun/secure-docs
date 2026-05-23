import { API_URL } from '../env'
import { getHeaders } from '@/utils/get-header'
import {
  AdminUsersResult,
  AlertsResult,
  UnresolvedAlertCount,
  UserDetailResult,
  AdminUser,
  AnomalyAlert,
  LoginActivitiesResult,
} from './types'
import type { z } from 'zod'
import {
  queryAdminUsersSchema,
  updateUserRoleSchema,
  banUserSchema,
  queryAlertsSchema,
  resolveAlertSchema,
  getAdminUserDetailSchema,
  queryLoginActivitiesSchema,
} from './schemas'

export const getAdminUsersFn = async ({
  data,
}: {
  data: z.infer<typeof queryAdminUsersSchema>
}): Promise<AdminUsersResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()
  if (data.page) params.set('page', String(data.page))
  if (data.limit) params.set('limit', String(data.limit))
  if (data.search) params.set('search', data.search)
  if (data.role) params.set('role', data.role)
  if (data.status) params.set('status', data.status)
  if (data.sortBy) params.set('sortBy', data.sortBy)
  if (data.sortOrder) params.set('sortOrder', data.sortOrder)
  const res = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
    headers,
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const getAdminUserDetailFn = async ({
  data,
}: {
  data: z.infer<typeof getAdminUserDetailSchema>
}): Promise<UserDetailResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/admin/users/${data.userId}`, { headers })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export const updateUserRoleFn = async ({
  data,
}: {
  data: z.infer<typeof updateUserRoleSchema>
}): Promise<AdminUser> => {
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
}

export const banUserFn = async ({
  data,
}: {
  data: z.infer<typeof banUserSchema>
}): Promise<AdminUser> => {
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
}

export const getAlertsFn = async ({
  data,
}: {
  data: z.infer<typeof queryAlertsSchema>
}): Promise<AlertsResult> => {
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
}

export const getUnresolvedAlertCountFn =
  async (): Promise<UnresolvedAlertCount> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/admin/alerts/unresolved-count`, {
      headers,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }
    return res.json()
  }

export const resolveAlertFn = async ({
  data,
}: {
  data: z.infer<typeof resolveAlertSchema>
}): Promise<AnomalyAlert> => {
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
}

export const getLoginActivitiesFn = async ({
  data,
}: {
  data: z.infer<typeof queryLoginActivitiesSchema>
}): Promise<LoginActivitiesResult> => {
  const headers = await getHeaders()
  const params = new URLSearchParams()
  if (data.page) params.set('page', String(data.page))
  if (data.limit) params.set('limit', String(data.limit))
  if (data.userId) params.set('userId', data.userId)
  if (data.suspiciousOnly) params.set('suspiciousOnly', 'true')
  const res = await fetch(
    `${API_URL}/admin/login-activities?${params.toString()}`,
    { headers },
  )
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}
