export type UserResponse = {
  id: string;
  staffId: string;
  name: string;
  department: string | null;
  role: string;
  manager: string | null;
};
