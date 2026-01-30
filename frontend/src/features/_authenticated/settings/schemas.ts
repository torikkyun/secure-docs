import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
})

export const recoverKeysSchema = z.object({
  mnemonic: z
    .string()
    .min(1, 'Vui lòng nhập mnemonic')
    .refine(
      (val) => val.trim().split(/\s+/).length === 12,
      'Mnemonic phải có đúng 12 từ',
    ),
  passcode: z
    .string()
    .length(6, 'Passcode phải có đúng 6 ký tự')
    .regex(/^\d+$/, 'Passcode chỉ chứa số'),
})
