import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Tên quá ngắn').optional(),
  avatar: z.string().optional(),
})

export const uploadAvatarSchema = z.instanceof(FormData)

export const queryUserSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
})

export const getUserByIdSchema = z.object({
  userId: z.string(),
})
