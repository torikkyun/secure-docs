/**
 * 📊 So sánh: TanStack Form vs React Hook Form vs Formik
 *
 * File này giúp bạn hiểu sự khác biệt giữa các thư viện form phổ biến
 */

// ============================================
// ❌ CÁCH CŨ: Vanilla React (không dùng thư viện)
// ============================================

import { useState } from 'react'

function VanillaForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })

  const validate = () => {
    const newErrors = { email: '', password: '' }

    if (!email.includes('@')) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (password.length < 6) {
      newErrors.password = 'Mật khẩu quá ngắn'
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      console.log({ email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <p>{errors.email}</p>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <p>{errors.password}</p>}

      <button type="submit">Submit</button>
    </form>
  )
}

// Nhược điểm:
// ❌ Nhiều boilerplate code
// ❌ Phải tự quản lý state cho từng field
// ❌ Validation logic rời rạc
// ❌ Khó scale với form phức tạp

// ============================================
// ✅ TANSTACK FORM (RECOMMENDED)
// ============================================

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu quá ngắn'),
})

function TanStackFormExample() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: schema, // ✨ Tích hợp Zod sẵn
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* Field với validation tự động */}
      <form.Field
        name="email"
        children={(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors[0] && (
              <p>{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors[0] && (
              <p>{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      <button type="submit">Submit</button>
    </form>
  )
}

// Ưu điểm TanStack Form:
// ✅ Type-safe với TypeScript
// ✅ Headless - tự do style
// ✅ Tích hợp Zod dễ dàng
// ✅ Async validation built-in
// ✅ Performance tối ưu (không re-render toàn form)
// ✅ Field-level validation
// ✅ Hỗ trợ nhiều framework (React, Vue, Solid, etc.)

// ============================================
// 📊 REACT HOOK FORM (để so sánh)
// ============================================

import { useForm as useRHF } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function ReactHookFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useRHF({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">Submit</button>
    </form>
  )
}

// Ưu điểm RHF:
// ✅ Rất phổ biến, nhiều tài liệu
// ✅ Performance tốt (uncontrolled inputs)
// ✅ API đơn giản với {...register()}
// ✅ Tích hợp Zod qua zodResolver

// Nhược điểm RHF:
// ❌ Chủ yếu cho React only
// ❌ Khó custom async validation
// ❌ Ít linh hoạt hơn với field-level logic

// ============================================
// 📊 FORMIK (để so sánh)
// ============================================

import { Formik, Field } from 'formik'

function FormikExample() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={(values) => {
        const errors: any = {}
        if (!values.email.includes('@')) {
          errors.email = 'Email không hợp lệ'
        }
        if (values.password.length < 6) {
          errors.password = 'Mật khẩu quá ngắn'
        }
        return errors
      }}
      onSubmit={(values) => {
        console.log(values)
      }}
    >
      {({ errors, touched, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Field name="email" />
          {touched.email && errors.email && <p>{errors.email}</p>}

          <Field name="password" type="password" />
          {touched.password && errors.password && <p>{errors.password}</p>}

          <button type="submit">Submit</button>
        </form>
      )}
    </Formik>
  )
}

// Ưu điểm Formik:
// ✅ API dễ hiểu
// ✅ Nhiều tài liệu và tutorial

// Nhược điểm Formik:
// ❌ Performance kém hơn (re-render nhiều)
// ❌ Bundle size lớn hơn
// ❌ Ít active development

// ============================================
// 🎯 KẾT LUẬN: Nên chọn thư viện nào?
// ============================================

/**
 * TANSTACK FORM - Chọn khi:
 * ✅ Bạn muốn type-safety mạnh mẽ
 * ✅ Cần async validation phức tạp
 * ✅ Muốn headless, tự do customize
 * ✅ Dự án dùng nhiều framework
 * ✅ Cần performance tối ưu
 *
 * REACT HOOK FORM - Chọn khi:
 * ✅ Muốn API đơn giản, dễ học
 * ✅ Chỉ dùng React
 * ✅ Cần ecosystem lớn
 * ✅ Form đơn giản, không quá phức tạp
 *
 * FORMIK - Chọn khi:
 * ❌ Không khuyến khích cho dự án mới
 * (TanStack Form hoặc RHF tốt hơn)
 *
 * VANILLA REACT - Chọn khi:
 * ✅ Form cực kỳ đơn giản (1-2 fields)
 * ✅ Không muốn thêm dependency
 */

// ============================================
// 📈 Benchmark Performance (ví dụ)
// ============================================

/**
 * Form với 50 fields:
 *
 * TanStack Form:  ~5ms re-render
 * React Hook Form: ~7ms re-render
 * Formik:         ~25ms re-render
 * Vanilla React:  ~30ms re-render
 *
 * (Số liệu chỉ mang tính tương đối)
 */

// ============================================
// 🎓 Học thêm
// ============================================

/**
 * TanStack Form:
 * - Docs: https://tanstack.com/form/latest
 * - Examples: https://tanstack.com/form/latest/docs/examples
 *
 * React Hook Form:
 * - Docs: https://react-hook-form.com
 *
 * Formik:
 * - Docs: https://formik.org
 */

export {
  TanStackFormExample as RecommendedForm,
  ReactHookFormExample,
  FormikExample,
  VanillaForm,
}
