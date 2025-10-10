import { Injectable } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        Actor: {
          select: {
            id: true,
            staffId: true,
            name: true,
          },
        },
        Status: {
          select: {
            name: true,
          },
        },
        ActionType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create({
    targetId,
    targetType,
    details,
    status,
    actionType,
    actorId,
  }: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        targetId,
        targetType,
        details,
        Status: {
          connect: { name: status },
        },
        ActionType: {
          connect: { name: actionType },
        },
        Actor: {
          connect: { id: actorId },
        },
      },
    });
  }
}
