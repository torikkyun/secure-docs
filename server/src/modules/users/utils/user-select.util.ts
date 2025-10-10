export const UserSelect = {
  id: true,
  staffId: true,
  name: true,
  Role: {
    select: {
      name: true,
    },
  },
  Department: {
    select: {
      code: true,
      name: true,
    },
  },
  Status: {
    select: {
      name: true,
    },
  },
};
