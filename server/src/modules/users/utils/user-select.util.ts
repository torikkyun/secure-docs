export const UserSelect = {
  id: true,
  staffId: true,
  name: true,
  department: true,
  Role: {
    select: {
      name: true,
    },
  },
  Manager: {
    select: { id: true, staffId: true, name: true },
  },
};
