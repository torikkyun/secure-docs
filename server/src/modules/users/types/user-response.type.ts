export type UserResponse = {
  id: string;
  email: string;
  googleId: string;
  name: string;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  role: { id: string; name: string };
  status: { id: string; name: string };
};
