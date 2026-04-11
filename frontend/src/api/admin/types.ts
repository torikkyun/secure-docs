export type AlertLevel = 'WARNING' | 'ALERT' | 'CRITICAL'
export type AlertType = 'STATISTICAL' | 'POLICY'

export type AdminUser = {
  id: string
  email: string
  name: string
  avatar: string
  isBanned: boolean
  createdAt: string
  updatedAt: string
  role: { id: string; name: string }
  _count: { ownedFiles: number; sentShares: number }
}

export type AdminUsersResult = {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AnomalyAlert = {
  id: string
  userId: string
  user: { id: string; name: string; email: string; avatar: string }
  level: AlertLevel
  type: AlertType
  description: string
  metadata: Record<
    string,
    string | number | boolean | null | undefined | object
  >
  isResolved: boolean
  createdAt: string
}

export type AlertsResult = {
  alerts: AnomalyAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type UnresolvedAlertCount = {
  count: number
}

export type UserDetailResult = {
  user: {
    id: string
    email: string
    name: string
    avatar: string
    isBanned: boolean
    createdAt: string
    role: { name: string }
  }
  activities: {
    id: string
    action: string
    createdAt: string
    file: { id: string; filename: string }
  }[]
  alerts: AnomalyAlert[]
}
