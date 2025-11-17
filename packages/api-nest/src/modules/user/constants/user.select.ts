import { Prisma } from "generated/prisma/client";

export const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const roleSelect = {
  id: true,
  name: true,
} satisfies Prisma.RoleSelect;

export const userWithRoleSelect = {
  ...userSelect,
  role: {
    select: roleSelect,
  },
} satisfies Prisma.UserSelect;
