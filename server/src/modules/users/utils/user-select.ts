export const userSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  lastLoginAt: true,
  role: { select: { id: true, name: true } },
  status: { select: { id: true, name: true } },
  googleId: true,
};
