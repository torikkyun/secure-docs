export type User = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export type PaginatedUsers = {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type UserProfile = User

export type LogoutResult = {
  success: boolean
}
