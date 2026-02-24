export type User = {
  id: string
  email: string
  name: string
  avatar: string | null
  publicKey: string
  createdAt: string
  updatedAt: string
  role: {
    name: string
  }
}

export type UserProfile = User

export type UpdateProfileResult = {
  id: string
  email: string
  name: string
  avatar: string | null
  updatedAt: string
}

export type UsersListResult = {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type UserDetailResult = User
