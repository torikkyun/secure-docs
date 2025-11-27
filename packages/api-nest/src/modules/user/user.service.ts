import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { serializeBigInt } from "src/common/utils/bigint.util";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { PrismaService } from "src/database/prisma.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";

@Injectable()
export class UserService {
  private readonly prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        storageUsed: true,
        storageLimit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return serializeBigInt(user);
  }

  async updateProfile(
    userId: string,
    { email, username }: UpdateUserProfileDto
  ) {
    if (email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException("Email đã được sử dụng bởi tài khoản khác");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(username !== undefined ? { username } : {}),
        ...(email !== undefined ? { email } : {}),
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        storageUsed: true,
        storageLimit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        role: { select: { name: true } },
      },
    });

    return serializeBigInt(user);
  }

  async getStorageInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const used = BigInt(user.storageUsed);
    const limit = BigInt(user.storageLimit);
    const remaining = limit - used;

    return serializeBigInt({
      storageUsed: used,
      storageLimit: limit,
      storageRemaining: remaining < 0n ? 0n : remaining,
    });
  }

  async findAll({ page = 1, limit = 10, search }: QueryUserDto) {
    const { take, skip } = getOffsetPagination(page, limit);

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          walletAddress: true,
          username: true,
          email: true,
          storageUsed: true,
          storageLimit: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          role: { select: { name: true } },
        },
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findByWallet(walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        publicKey: true,
        storageUsed: true,
        storageLimit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return serializeBigInt(user);
  }
}
