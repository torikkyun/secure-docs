import { z } from 'zod'

export const queryFileActivitySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const getFileActivitiesSchema = z.object({
  fileId: z.string(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})
