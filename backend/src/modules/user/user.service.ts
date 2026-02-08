import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { PrismaService } from "src/database/prisma.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { RedisService } from "src/infrastructure/cache/redis.service";
import { CacheVersionService } from "src/infrastructure/cache/cache-version.service";
import { CacheKeyFactory } from "src/infrastructure/cache/cache-key.factory";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cacheVersion: CacheVersionService,
  ) {}

  async getProfile(userId: string) {
    const version = await this.cacheVersion.get(
      `users:profile:${userId}:version`,
    );

    const cacheKey = CacheKeyFactory.userProfile(userId, version);

    const cached = await this.redis.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

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

    await this.redis.set(cacheKey, user, 300000);

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
    await this.cacheVersion.bump("users:list:version");

    return updatedUser;
  }

  async findAll({ page = 1, limit = 10, search }: QueryUserDto) {
    const version = await this.cacheVersion.get("users:list:version");

    const cacheKey = CacheKeyFactory.usersList(version, {
      page,
      limit,
      search,
    });

    const cached = await this.redis.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

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

    await this.redis.set(
      cacheKey,
      {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      60000,
    );

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
