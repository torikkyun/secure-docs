import { z } from 'zod'

export const getFileSchema = z.uuid('ID file không hợp lệ')

export const queryFileSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const uploadFileSchema = z.custom<FormData>()

export const deleteFileSchema = z.object({
  fileId: z.uuid('ID file không hợp lệ'),
})

export const shareFileSchema = z.object({
  fileId: z.string(),
  recipients: z.array(
    z.object({
      recipientId: z.string(),
      wrappedAesKey: z.string(),
    }),
  ),
})
