import { z } from 'zod'

export const queryAdminUsersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  search: z.string().optional(),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'manager', 'user']),
})

export const banUserSchema = z.object({
  userId: z.string().min(1),
  isBanned: z.boolean(),
})

export const queryAlertsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  level: z.enum(['WARNING', 'ALERT', 'CRITICAL']).optional(),
  type: z.enum(['STATISTICAL', 'POLICY']).optional(),
  isResolved: z.boolean().optional(),
  userId: z.string().optional(),
})

export const resolveAlertSchema = z.object({
  alertId: z.string().min(1),
  isResolved: z.boolean(),
})

export const getAdminUserDetailSchema = z.object({
  userId: z.string().min(1),
})
