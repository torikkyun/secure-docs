import { z } from 'zod'

export const recipientShareSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID không được để trống'),
  wrappedAesKey: z.string().min(1, 'Wrapped AES key không được để trống'),
})

export const createShareSchema = z.object({
  fileId: z.string().min(1, 'File ID không được để trống'),
  recipients: z.array(recipientShareSchema).min(1, 'Cần ít nhất 1 người nhận'),
})

export const revokeShareSchema = z.object({
  fileId: z.string().min(1, 'File ID không được để trống'),
  recipientId: z.string().min(1, 'Recipient ID không được để trống'),
})
