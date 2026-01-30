/**
 * 🎓 Tích hợp TanStack Form + TanStack Start
 *
 * File này demo cách kết hợp 2 thư viện để có:
 * - Client-side validation (realtime feedback)
 * - Server-side validation (security)
 * - Type-safe end-to-end
 */

import { useForm } from '@tanstack/react-form'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useState } from 'react'

// ============================================
// 📚 BƯỚC 1: Định nghĩa Schema (dùng chung)
// ============================================

/**
 * ✨ KEY POINT: Schema này được dùng cho:
 * 1. Client validation (TanStack Form)
 * 2. Server validation (TanStack Start)
 *
 * → Đảm bảo validation rules GIỐNG NHAU ở cả 2 nơi
 */
export const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ').max(255, 'Email quá dài'),

    password: z
      .string()
      .min(6, 'Mật khẩu ít nhất 6 ký tự')
      .max(100, 'Mật khẩu tối đa 100 ký tự')
      .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Phải có ít nhất 1 số'),

    confirmPassword: z.string(),

    fullName: z.string().min(2, 'Tên quá ngắn').max(100, 'Tên quá dài'),

    age: z
      .number()
      .int('Tuổi phải là số nguyên')
      .min(13, 'Phải từ 13 tuổi trở lên')
      .max(120, 'Tuổi không hợp lệ'),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Lỗi hiển thị ở field confirmPassword
  })

// Type inference từ schema
export type RegisterInput = z.infer<typeof registerSchema>

// ============================================
// 📚 BƯỚC 2: Tạo Server Function
// ============================================

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'

/**
 * Server function để đăng ký user
 *
 * ✨ KEY POINTS:
 * 1. Dùng SAME schema cho validation
 * 2. Validation ở server là BẮT BUỘC (security)
 * 3. Có thể thêm validation phức tạp hơn (check DB, etc.)
 */
export const registerMutation = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema) // ✨ Server validation
  .handler(async ({ data }) => {
    // Data đã được validate bởi Zod ✅
    // Type-safe: data có type RegisterInput

    // Có thể thêm validation với database
    // const existingUser = await db.user.findUnique({ where: { email: data.email } })
    // if (existingUser) throw new Error('Email đã tồn tại')

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          age: data.age,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Đăng ký thất bại')
      }

      const result = await res.json()

      return {
        success: true,
        message: 'Đăng ký thành công!',
        user: result.user,
      }
    } catch (error) {
      throw error
    }
  })

// ============================================
// 📚 BƯỚC 3: Tạo Form Component
// ============================================

export function RegisterFormIntegrated() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      age: 18,
      agreeToTerms: false,
    },

    // ✨ Client-side validation với SAME schema
    validators: {
      onChange: registerSchema,
    },

    // ✨ Submit handler
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setServerError(null)

      try {
        // Gọi server function
        // ✨ Server sẽ validate LẠI với cùng schema
        const result = await registerMutation({ data: value })

        alert(`${result.message}\nChào mừng ${result.user.fullName}!`)

        // Reset form sau khi thành công
        form.reset()
      } catch (error: any) {
        // Hiển thị lỗi từ server
        setServerError(error.message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Đăng ký tài khoản</h2>

      {/* Hiển thị lỗi từ server */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {serverError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        {/* Email Field */}
        <form.Field
          name="email"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Email *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="email@example.com"
                className={`w-full p-2 border rounded ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Full Name Field */}
        <form.Field
          name="fullName"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Họ và tên *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Nguyễn Văn A"
                className={`w-full p-2 border rounded ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Age Field */}
        <form.Field
          name="age"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Tuổi *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                onBlur={field.handleBlur}
                min="13"
                max="120"
                className={`w-full p-2 border rounded ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Password Field */}
        <form.Field
          name="password"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Mật khẩu *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="••••••"
                className={`w-full p-2 border rounded ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}

              {/* Password strength indicator */}
              {field.state.value && (
                <div className="mt-2 text-xs space-y-1">
                  <div
                    className={
                      field.state.value.length >= 6
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }
                  >
                    {field.state.value.length >= 6 ? '✓' : '○'} Ít nhất 6 ký tự
                  </div>
                  <div
                    className={
                      /[A-Z]/.test(field.state.value)
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }
                  >
                    {/[A-Z]/.test(field.state.value) ? '✓' : '○'} Có chữ hoa
                  </div>
                  <div
                    className={
                      /[a-z]/.test(field.state.value)
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }
                  >
                    {/[a-z]/.test(field.state.value) ? '✓' : '○'} Có chữ thường
                  </div>
                  <div
                    className={
                      /[0-9]/.test(field.state.value)
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }
                  >
                    {/[0-9]/.test(field.state.value) ? '✓' : '○'} Có số
                  </div>
                </div>
              )}
            </div>
          )}
        />

        {/* Confirm Password Field */}
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Xác nhận mật khẩu *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="••••••"
                className={`w-full p-2 border rounded ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Terms Checkbox */}
        <form.Field
          name="agreeToTerms"
          children={(field) => (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  onBlur={field.handleBlur}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-blue-500 underline">
                    Điều khoản sử dụng
                  </a>
                </span>
              </label>
              {field.state.meta.errors[0] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !form.state.canSubmit}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium"
        >
          {isSubmitting ? '⏳ Đang đăng ký...' : '🚀 Đăng ký'}
        </button>

        {/* Form State Debug (optional) */}
        <details className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <summary className="cursor-pointer font-bold">
            🐛 Debug: Form State
          </summary>
          <pre className="mt-2 overflow-auto text-[10px]">
            {JSON.stringify(
              {
                canSubmit: form.state.canSubmit,
                isSubmitting: form.state.isSubmitting,
                isValid: form.state.isValid,
                isDirty: form.state.isDirty,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </form>
    </div>
  )
}

// ============================================
// 💡 GIẢI THÍCH FLOW
// ============================================

/**
 * FLOW KHI USER SUBMIT FORM:
 *
 * 1. User điền form và click "Đăng ký"
 *    ↓
 * 2. TanStack Form validate CLIENT-SIDE với registerSchema
 *    - Nếu có lỗi → Hiển thị lỗi ngay, KHÔNG gửi request
 *    - Nếu OK → Tiếp tục bước 3
 *    ↓
 * 3. Gọi registerMutation({ data: value })
 *    - Gửi HTTP POST request lên server
 *    ↓
 * 4. TanStack Start validate SERVER-SIDE với registerSchema
 *    - Validate LẠI để đảm bảo security
 *    - Có thể thêm validation với database
 *    - Nếu có lỗi → Throw error → Client catch
 *    - Nếu OK → Tiếp tục bước 5
 *    ↓
 * 5. Server handler xử lý logic:
 *    - Gọi backend API
 *    - Lưu database
 *    - Return kết quả
 *    ↓
 * 6. Client nhận kết quả:
 *    - Success → Alert + reset form
 *    - Error → Hiển thị error message
 */

// ============================================
// ✅ LỢI ÍCH CỦA CÁCH NÀY
// ============================================

/**
 * 1. VALIDATION 2 LỚP:
 *    - Client: UX tốt, feedback ngay lập tức
 *    - Server: Security, không thể bypass
 *
 * 2. TYPE-SAFE END-TO-END:
 *    - Schema → Type inference → Type-safe trong toàn bộ app
 *
 * 3. DRY (Don't Repeat Yourself):
 *    - 1 schema dùng cho cả client và server
 *    - Không phải viết validation logic 2 lần
 *
 * 4. MAINTAINABLE:
 *    - Thay đổi validation rules → Sửa 1 chỗ (schema)
 *    - Tự động sync giữa client và server
 */

// ============================================
// 📚 BEST PRACTICES
// ============================================

/**
 * ✅ DO:
 *
 * 1. Luôn validate ở CẢ CLIENT và SERVER
 * 2. Dùng CÙNG schema cho cả 2
 * 3. Handle errors rõ ràng
 * 4. Hiển thị loading state khi submit
 * 5. Reset form sau khi submit thành công
 * 6. Type return value của server function
 *
 * ❌ DON'T:
 *
 * 1. Đừng chỉ validate trên client (insecure!)
 * 2. Đừng dùng khác schema cho client và server
 * 3. Đừng bỏ qua error handling
 * 4. Đừng quên disable button khi submitting
 */
