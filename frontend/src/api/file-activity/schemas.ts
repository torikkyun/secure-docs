import { z } from 'zod'

export const FILE_ACTIVITY_ACTIONS = [
  'UPLOAD',
  'DOWNLOAD',
  'SHARE',
  'DELETE',
  'REVOKE_SHARE',
  'VIEW',
] as const

export type FileActivityAction = (typeof FILE_ACTIVITY_ACTIONS)[number]

export const queryFileActivitySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  action: z.enum(FILE_ACTIVITY_ACTIONS).optional(),
})

export const getFileActivitiesSchema = z.object({
  fileId: z.string(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})
