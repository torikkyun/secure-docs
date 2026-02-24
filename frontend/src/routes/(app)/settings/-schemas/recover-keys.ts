import { z } from 'zod'

export const recoverKeysSchema = z.object({
  mnemonic: z
    .string()
    .min(1, 'Mnemonic không được để trống')
    .refine(
      (val) => val.trim().split(/\s+/).length === 12,
      'Mnemonic phải có đúng 12 từ',
    ),
  passcode: z
    .string()
    .length(6, 'Passcode phải có đúng 6 chữ số')
    .regex(/^\d{6}$/, 'Passcode chỉ được chứa chữ số'),
})

export type RecoverKeysFormValues = z.infer<typeof recoverKeysSchema>
