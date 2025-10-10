import { Request } from 'express';
import { CreateUserDto } from '../dtos/create-user.dto';

export function buildUserCreateAuditDetails({
  input,
  errorReason,
  req,
}: {
  input: Partial<CreateUserDto> & { role: string; departmentCode: string };
  errorReason?: string;
  req?: Request;
}): Record<string, any> {
  const baseDetails = {
    attemptedStaffId: input.staffId,
    attemptedName: input.name,
    attemptedRole: input.role,
    attemptedDepartmentCode: input.departmentCode,

    ip: req?.ip || 'unknown',
    userAgent: req?.get('User-Agent') || 'unknown',
  };

  if (errorReason) {
    return {
      ...baseDetails,
      reason: errorReason,
    };
  }

  return {
    ...baseDetails,
  };
}
