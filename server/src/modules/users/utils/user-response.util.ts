import { UserDetail } from '../types/user-detail.type';
import { UserResponse } from '../types/user-reponse.type';

export function buildUserResponse(user: UserDetail): UserResponse {
  return {
    id: user.id,
    staffId: user.staffId,
    name: user.name,
    role: user.Role.name,
    department: {
      code: user.Department.code,
      name: user.Department.name,
    },
    status: user.Status.name,
  };
}
