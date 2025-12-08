import { Injectable } from "@nestjs/common";
import { serializeBigInt } from "src/common/utils/bigint.util";
import { hashPassword } from "src/common/utils/hash.util";
import { PrismaService } from "src/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class AdminService {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true,
          _count: {
            select: {
              files: true,
              grantsGiven: true,
              grantsReceived: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count(),
    ]);

    return serializeBigInt({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        files: true,
        grantsGiven: true,
        grantsReceived: true,
        sessions: {
          where: { isActive: true },
          orderBy: { lastActivityAt: "desc" },
        },
      },
    });
    return serializeBigInt(user);
  }

  async createUser(dto: CreateUserDto) {
    const userRole = await this.prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      throw new Error("User role not found");
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        walletAddress: dto.walletAddress,
        publicKey: dto.publicKey,
        password: dto.password ? hashPassword(dto.password) : null,
        roleId: userRole.id,
      },
      include: { role: true },
    });
    return serializeBigInt(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });
    return serializeBigInt(user);
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return serializeBigInt(user);
  }

  async banUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { role: true },
    });
    return serializeBigInt(user);
  }

  async unbanUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: { role: true },
    });
    return serializeBigInt(user);
  }

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalFiles,
      totalGrants,
      totalDownloads,
      storageStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.file.count(),
      this.prisma.accessGrant.count(),
      this.prisma.download.count(),
      this.prisma.user.aggregate({
        _sum: { storageUsed: true },
      }),
    ]);

    return serializeBigInt({
      totalUsers,
      activeUsers,
      totalFiles,
      totalGrants,
      totalDownloads,
      totalStorageUsed: storageStats._sum.storageUsed || BigInt(0),
    });
  }

  async getAllFiles(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          status: true,
          _count: {
            select: {
              grants: true,
              downloads: true,
            },
          },
        },
        orderBy: { uploadTimestamp: "desc" },
      }),
      this.prisma.file.count(),
    ]);

    return serializeBigInt({
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async getAllGrants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [grants, total] = await Promise.all([
      this.prisma.accessGrant.findMany({
        skip,
        take: limit,
        include: {
          file: {
            select: {
              id: true,
              fileName: true,
            },
          },
          grantor: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          grantee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          status: true,
        },
        orderBy: { grantedAt: "desc" },
      }),
      this.prisma.accessGrant.count(),
    ]);

    return serializeBigInt({
      grants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          eventType: true,
        },
        orderBy: { timestamp: "desc" },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
