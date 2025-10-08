export type UserWithRoleAndManager = {
  id: string;
  staffId: string;
  name: string;
  department?: string | null;
  Role: { name: string };
  Manager?: { name: string } | null;
};
