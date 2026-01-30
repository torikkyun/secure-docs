/**
 * 🎓 TanStack Start - Ví dụ Server Functions nâng cao
 *
 * File này demo các pattern hay dùng với TanStack Start Server Functions
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const API_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

// ============================================
// 📚 VÍ DỤ 1: GET Request (Lấy dữ liệu)
// ============================================

/**
 * Lấy danh sách users
 * - Method: GET (idempotent, có thể cache)
 * - Không cần input validation (không có params)
 */
export const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const res = await fetch(`${API_URL}/users`)

  if (!res.ok) {
    throw new Error('Không thể lấy danh sách users')
  }

  return res.json()
})

// Cách dùng:
// const users = await getUsers()

// ============================================
// 📚 VÍ DỤ 2: GET với params
// ============================================

const GetUserByIdSchema = z.object({
  userId: z.string().uuid('User ID phải là UUID'),
})

/**
 * Lấy thông tin 1 user theo ID
 * - Method: GET
 * - Có validation cho userId
 */
export const getUserById = createServerFn({ method: 'GET' })
  .inputValidator(GetUserByIdSchema)
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/users/${data.userId}`)

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('User không tồn tại')
      }
      throw new Error('Có lỗi xảy ra')
    }

    return res.json()
  })

// Cách dùng:
// const user = await getUserById({ data: { userId: '123' } })

// ============================================
// 📚 VÍ DỤ 3: POST với validation phức tạp
// ============================================

const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(255),
  password: z
    .string()
    .min(6, 'Mật khẩu ít nhất 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  fullName: z.string().min(2, 'Tên quá ngắn').max(100, 'Tên quá dài'),
  publicKey: z.string().optional(),
})

/**
 * Đăng ký user mới
 * - Method: POST
 * - Validation chi tiết với Zod
 * - Error handling tốt
 */
export const registerMutation = createServerFn({ method: 'POST' })
  .inputValidator(RegisterSchema)
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()

        // Xử lý các loại lỗi khác nhau
        if (res.status === 409) {
          throw new Error('Email đã tồn tại')
        }

        throw new Error(error.message || 'Đăng ký thất bại')
      }

      const result = await res.json()

      return {
        success: true,
        message: 'Đăng ký thành công',
        user: result.user,
      }
    } catch (error) {
      // Re-throw để client có thể catch
      throw error
    }
  })

// Cách dùng:
// try {
//   const result = await registerMutation({
//     data: { email: 'user@example.com', password: 'Pass123', fullName: 'John Doe' }
//   })
//   alert(result.message)
// } catch (error) {
//   alert(error.message)
// }

// ============================================
// 📚 VÍ DỤ 4: POST với authentication token
// ============================================

const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

export type LoginResult = {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    email: string
    fullName: string
  }
}

/**
 * Đăng nhập và lưu token
 * - Method: POST
 * - Return type được định nghĩa rõ ràng
 */
export const loginMutation = createServerFn({ method: 'POST' })
  .inputValidator(LoginSchema)
  .handler(async ({ data }): Promise<LoginResult> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()

      if (res.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng')
      }

      throw new Error(error.message || 'Đăng nhập thất bại')
    }

    const result = await res.json()

    return {
      success: true,
      message: 'Đăng nhập thành công',
      token: result.token,
      user: result.user,
    }
  })

// Cách dùng với type-safety:
// const result: LoginResult = await loginMutation({
//   data: { email: 'user@example.com', password: 'pass123' }
// })

// ============================================
// 📚 VÍ DỤ 5: DELETE Request
// ============================================

const DeleteFileSchema = z.object({
  fileId: z.string().uuid('File ID không hợp lệ'),
})

/**
 * Xóa file
 * - Method: POST (không dùng DELETE vì có thể cần CSRF protection)
 * - Có validation
 */
export const deleteFile = createServerFn({ method: 'POST' })
  .inputValidator(DeleteFileSchema)
  .handler(async ({ data }) => {
    // Trong production, cần check authorization ở đây
    // if (!context.user) throw new Error('Unauthorized')

    const res = await fetch(`${API_URL}/files/${data.fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${context.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('File không tồn tại')
      }
      if (res.status === 403) {
        throw new Error('Bạn không có quyền xóa file này')
      }
      throw new Error('Không thể xóa file')
    }

    return { success: true, message: 'Xóa file thành công' }
  })

// ============================================
// 📚 VÍ DỤ 6: Upload file (FormData)
// ============================================

/**
 * Upload file lên server
 * - Method: POST
 * - Xử lý FormData
 */
export const uploadFile = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => {
    const file = data.get('file') as File

    if (!file) {
      throw new Error('File là bắt buộc')
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File quá lớn (tối đa 10MB)')
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ]
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Loại file không được hỗ trợ')
    }

    return data
  })
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      body: data, // FormData tự động set Content-Type
    })

    if (!res.ok) {
      throw new Error('Upload thất bại')
    }

    return res.json()
  })

// Cách dùng:
// const formData = new FormData()
// formData.append('file', fileInput.files[0])
// const result = await uploadFile({ data: formData })

// ============================================
// 📚 VÍ DỤ 7: Refetch pattern (với debounce)
// ============================================

const SearchUsersSchema = z.object({
  query: z.string().min(1, 'Query không được rỗng'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

/**
 * Search users với pagination
 * - Method: GET
 * - Có pagination
 * - Nên dùng với debounce trên client
 */
export const searchUsers = createServerFn({ method: 'GET' })
  .inputValidator(SearchUsersSchema)
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      q: data.query,
      page: data.page.toString(),
      limit: data.limit.toString(),
    })

    const res = await fetch(`${API_URL}/users/search?${params}`)

    if (!res.ok) {
      throw new Error('Tìm kiếm thất bại')
    }

    const result = await res.json()

    return {
      users: result.data,
      total: result.total,
      page: data.page,
      hasMore: result.total > data.page * data.limit,
    }
  })

// Cách dùng với debounce:
// import { useDebouncedCallback } from 'use-debounce'
//
// const debouncedSearch = useDebouncedCallback(async (query) => {
//   const result = await searchUsers({ data: { query, page: 1, limit: 20 } })
//   setResults(result.users)
// }, 500)

// ============================================
// 📚 VÍ DỤ 8: Optimistic updates
// ============================================

const UpdateProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(2),
  bio: z.string().max(500).optional(),
})

/**
 * Cập nhật profile
 * - Method: POST
 * - Phù hợp cho optimistic updates
 */
export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator(UpdateProfileSchema)
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/users/${data.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        bio: data.bio,
      }),
    })

    if (!res.ok) {
      throw new Error('Cập nhật thất bại')
    }

    return res.json()
  })

// Cách dùng với optimistic update:
// // 1. Update UI ngay lập tức
// setUser({ ...user, fullName: newName })
//
// // 2. Gửi request lên server
// try {
//   await updateProfile({ data: { userId: user.id, fullName: newName } })
// } catch (error) {
//   // 3. Nếu fail, rollback UI
//   setUser(oldUser)
//   alert('Cập nhật thất bại')
// }

// ============================================
// 💡 TIPS & BEST PRACTICES
// ============================================

/**
 * ✅ DO:
 * 1. Luôn validate input với Zod
 * 2. Handle errors cụ thể (404, 403, 409, etc.)
 * 3. Type return value rõ ràng
 * 4. Throw Error với message rõ ràng cho client
 * 5. Dùng GET cho read, POST cho write
 *
 * ❌ DON'T:
 * 1. Đừng expose secrets trong response
 * 2. Đừng tin tưởng input mà không validate
 * 3. Đừng dùng any type
 * 4. Đừng quên error handling
 */

// ============================================
// 📊 EXPORT TYPES cho client sử dụng
// ============================================

export type User = {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
