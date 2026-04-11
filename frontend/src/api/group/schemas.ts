import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Tên nhóm phải có ít nhất 2 ký tự').max(100),
  description: z.string().max(500).optional(),
})

export const updateGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
})

export const addGroupMemberSchema = z.object({
  groupId: z.string().min(1),
  userId: z.string().min(1),
})

export const removeGroupMemberSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
})

export const deleteGroupSchema = z.object({
  id: z.string().min(1),
})

export const queryGroupSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  search: z.string().optional(),
  memberId: z.string().optional(),
})

export const getGroupByIdSchema = z.object({
  id: z.string().min(1),
})
