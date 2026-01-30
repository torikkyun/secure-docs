import { z } from 'zod'

export const queryUserSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const getUserByIdSchema = z.object({
  userId: z.uuid('ID user không hợp lệ'),
})
