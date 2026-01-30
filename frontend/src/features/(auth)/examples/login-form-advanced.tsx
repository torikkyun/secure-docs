/**
 * 🎓 TanStack Form - Ví dụ nâng cao
 *
 * File này demo các tính năng nâng cao của TanStack Form:
 * 1. Custom validation functions (đồng bộ & bất đồng bộ)
 * 2. Field-level validation vs Form-level validation
 * 3. Debounce async validation
 * 4. Display validation state (isValidating, isTouched, isDirty)
 */

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'

// Schema validation với Zod
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

export function LoginFormAdvanced() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    // ✅ CÁCH 1: Validate toàn bộ form với Zod schema
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Đăng nhập thất bại')
        }

        const result = await res.json()
        alert(`Đăng nhập thành công: ${result.message}`)
      } catch (error: any) {
        alert(`Lỗi: ${error.message}`)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Đăng nhập (Advanced)</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        {/* ✅ FIELD EMAIL với validation tùy chỉnh */}
        <form.Field
          name="email"
          // ✅ CÁCH 2: Validate từng field riêng lẻ
          validators={{
            // Validation đồng bộ - chạy ngay khi thay đổi
            onChange: ({ value }) => {
              if (!value) return 'Email là bắt buộc'
              if (!value.includes('@')) return 'Email phải có @'
              return undefined // undefined = không có lỗi
            },

            // Validation bất đồng bộ - kiểm tra với server
            onChangeAsync: async ({ value }) => {
              // Giả lập kiểm tra email đã tồn tại trên server
              await new Promise((resolve) => setTimeout(resolve, 500))

              const bannedEmails = ['spam@test.com', 'fake@test.com']
              if (bannedEmails.includes(value.toLowerCase())) {
                return 'Email này đã bị cấm'
              }
              return undefined
            },
            // Debounce async validation 500ms
            onChangeAsyncDebounceMs: 500,
          }}
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Email
                {/* Hiển thị trạng thái validation */}
                {field.state.meta.isValidating && (
                  <span className="ml-2 text-blue-500 text-sm">
                    ⏳ Đang kiểm tra...
                  </span>
                )}
              </label>

              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="email@example.com"
                className={`w-full p-2 border rounded transition-colors ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200'
                } focus:outline-none focus:ring-2`}
              />

              {/* Hiển thị lỗi validation */}
              {field.state.meta.errors.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  ❌ {field.state.meta.errors[0]}
                </p>
              )}

              {/* Hiển thị thông tin field state (để học) */}
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                <div>
                  Touched: {field.state.meta.isTouched ? '✅' : '❌'} | Dirty:{' '}
                  {field.state.meta.isDirty ? '✅' : '❌'}
                </div>
              </div>
            </div>
          )}
        />

        {/* ✅ FIELD PASSWORD */}
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (value.length < 6) {
                return 'Mật khẩu phải có ít nhất 6 ký tự'
              }
              if (!/[A-Z]/.test(value)) {
                return 'Mật khẩu phải có ít nhất 1 chữ in hoa'
              }
              return undefined
            },
          }}
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1 font-medium">
                Mật khẩu
              </label>

              <input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="••••••"
                className={`w-full p-2 border rounded transition-colors ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200'
                } focus:outline-none focus:ring-2`}
              />

              {field.state.meta.errors.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  ❌ {field.state.meta.errors[0]}
                </p>
              )}

              {/* Password strength indicator */}
              {field.state.value && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => {
                      const strength =
                        field.state.value.length >= 8
                          ? 3
                          : field.state.value.length >= 6
                            ? 2
                            : 1
                      return (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < strength ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Độ mạnh:{' '}
                    {field.state.value.length >= 8
                      ? 'Mạnh 💪'
                      : field.state.value.length >= 6
                        ? 'Trung bình'
                        : 'Yếu'}
                  </p>
                </div>
              )}
            </div>
          )}
        />

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium"
          disabled={isSubmitting || form.state.isSubmitting}
        >
          {isSubmitting ? '⏳ Đang đăng nhập...' : '🚀 Đăng nhập'}
        </button>

        {/* Form state info (để học) */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <h4 className="font-bold mb-2">📊 Form State (để học):</h4>
          <pre className="text-[10px] overflow-auto">
            {JSON.stringify(
              {
                canSubmit: form.state.canSubmit,
                isSubmitting: form.state.isSubmitting,
                isValid: form.state.isValid,
                isDirty: form.state.isDirty,
                values: form.state.values,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </form>
    </div>
  )
}
