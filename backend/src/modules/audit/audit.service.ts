import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateAuditDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly eventTypeCache: Map<string, string> = new Map();
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async log({ eventType, ...res }: CreateAuditDto): Promise<void> {
    try {
      const eventTypeId = await this.getEventTypeId(eventType);

      await this.prisma.auditLog.create({
        data: {
          ...res,
          eventTypeId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async findAll() {
    return await this.prisma.auditLog.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.auditLog.findUnique({ where: { id } });
  }

  private async getEventTypeId(name: string): Promise<string> {
    const cachedId = this.eventTypeCache.get(name);
    if (cachedId) {
      return cachedId;
    }

    const eventType = await this.prisma.eventType.findUnique({
      where: { name },
    });

    if (!eventType) {
      throw new Error(`EventType '${name}' không tồn tại`);
    }

    this.eventTypeCache.set(name, eventType.id);
    return eventType.id;
  }
}
