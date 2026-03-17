import { z } from 'zod'

export const uploadFilesSchema = z.instanceof(FormData)

export const queryFileSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  filter: z.enum(['all', 'shared', 'owned']).optional(),
  sortBy: z.enum(['filename', 'createdAt', 'size']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  fileType: z.enum(['pdf', 'word', 'excel', 'image']).optional(),
  ownerId: z.string().optional(),
  sharedWithId: z.string().optional(),
})

export const getFileByIdSchema = z.object({
  fileId: z.string(),
})

export const deleteFileSchema = z.object({
  fileId: z.string(),
})
