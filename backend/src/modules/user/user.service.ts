import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { PrismaService } from "src/database/prisma.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CacheVersionService } from "src/infrastructure/cache/cache-version.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { VersionedCache } from "src/infrastructure/cache/decorators/versioned-cache.decorator";
import type { Cache } from "cache-manager";

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER)
    public readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly cacheVersion: CacheVersionService,
  ) {}

  @VersionedCache({
    prefix: "users:profile",
    versionKey: (args) => `users:profile:${args[0]}:version`,
    ttl: 300000,
  })
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        publicKey: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User không tồn tại");
    }

    return user;
  }

  async updateProfile(userId: string, { name, avatar }: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        updatedAt: true,
      },
    });

    await this.cacheVersion.bump(`users:profile:${userId}:version`);
    await this.cacheVersion.bump("users:version");

    return updatedUser;
  }

  @VersionedCache({
    prefix: "users",
    versionKey: "users:version",
    ttl: 60000,
  })
  async findAll({ page = 1, limit = 10, search }: QueryUserDto) {
    const { take, skip } = getOffsetPagination(page, limit);

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          publicKey: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              name: true,
            },
          },
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
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        publicKey: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    return user;
  }
}
