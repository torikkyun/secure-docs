export type GroupMember = {
  id: string
  name: string
  email: string
  avatar: string
  publicKey: string
  role: { name: string }
}

export type GroupItem = {
  id: string
  name: string
  description?: string
  createdById: string
  createdBy: {
    id: string
    name: string
    email: string
    avatar: string
  }
  createdAt: string
  _count?: { members: number }
}

export type GroupDetail = GroupItem & {
  members: GroupMember[]
}

export type GroupListResult = {
  groups: GroupItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
