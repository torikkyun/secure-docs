import { z } from 'zod'

export const queryFileActivitySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
})

export const getFileActivitiesSchema = z.object({
  fileId: z.uuid('ID file không hợp lệ'),
  page: z.number().optional(),
  limit: z.number().optional(),
})
