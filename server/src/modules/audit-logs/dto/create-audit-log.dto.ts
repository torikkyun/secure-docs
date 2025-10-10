import { Prisma } from 'generated/prisma';

export class CreateAuditLogDto {
  targetId?: string;
  targetType?: string;
  status: string;
  actionType: string;
  actorId: string;
  details?:
    | Prisma.NullableJsonNullValueInput
    | Prisma.InputJsonValue
    | undefined;
}
