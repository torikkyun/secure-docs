import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { QueryAlertDto } from "./dto/query-alert.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { ResolveAlertDto } from "./dto/resolve-alert.dto";
import { getOffsetPagination } from "@/common/utils/pagination.util";
import { Prisma } from "@/prisma/client";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers({
    page = 1,
    limit = 20,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { take, skip } = getOffsetPagination(page, limit);

    const where: Prisma.UserWhereInput = {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          role: { select: { id: true, name: true } },
          _count: {
            select: { ownedFiles: true, sentShares: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserRole(userId: string, { role }: UpdateUserRoleDto) {
    const roleRecord = await this.prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      throw new NotFoundException("Vai trò không tồn tại");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: roleRecord.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: { select: { name: true } },
      },
    });
  }

  async toggleBan(userId: string, isBanned: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
      },
    });
  }

  async getAlerts({
    page = 1,
    limit = 20,
    level,
    type,
    isResolved,
    userId,
  }: QueryAlertDto) {
    const { take, skip } = getOffsetPagination(page, limit);

    const where: Prisma.AnomalyAlertWhereInput = {
      ...(level ? { level } : {}),
      ...(type ? { type } : {}),
      ...(isResolved !== undefined ? { isResolved } : {}),
      ...(userId ? { userId } : {}),
    };

    const [alerts, total] = await Promise.all([
      this.prisma.anomalyAlert.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.anomalyAlert.count({ where }),
    ]);

    return { alerts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async resolveAlert(alertId: string, { isResolved }: ResolveAlertDto) {
    const alert = await this.prisma.anomalyAlert.findUnique({
      where: { id: alertId },
      select: { id: true },
    });

    if (!alert) {
      throw new NotFoundException("Không tìm thấy cảnh báo");
    }

    return this.prisma.anomalyAlert.update({
      where: { id: alertId },
      data: { isResolved },
      select: { id: true, isResolved: true },
    });
  }

  async getUnresolvedAlertCount() {
    const count = await this.prisma.anomalyAlert.count({
      where: { isResolved: false },
    });
    return { count };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isBanned: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activities, alerts] = await Promise.all([
      this.prisma.fileActivity.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          action: true,
          createdAt: true,
          file: { select: { id: true, filename: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      this.prisma.anomalyAlert.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return { user, activities, alerts };
  }
}
