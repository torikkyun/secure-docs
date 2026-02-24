import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

export const registerFormSchema = loginSchema.extend({
  name: z.string().min(2, 'Tên quá ngắn'),
  passcode: z
    .string()
    .length(6, 'Mã khóa phải đúng 6 ký tự')
    .refine((v) => v.length !== 6 || /^\d+$/.test(v), {
      message: 'Mã khóa chỉ được chứa chữ số',
    }),
})

export const registerSchema = registerFormSchema.extend({
  publicKey: z.string(),
})

export const verifyPasscodeSchema = z.object({
  passcode: z
    .string()
    .length(6, 'Mã khóa phải đúng 6 ký tự')
    .regex(/^\d+$/, 'Mã khóa chỉ được chứa chữ số'),
})
