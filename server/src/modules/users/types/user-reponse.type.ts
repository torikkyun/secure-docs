export type UserResponse = {
  id: string;
  staffId: string;
  name: string;
  department: {
    code: string;
    name: string;
  };
  role: string;
  status: string;
};
