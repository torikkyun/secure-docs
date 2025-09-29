import { PrismaService } from '@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { Prisma } from 'generated/prisma';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    email,
    page,
    limit,
    skip,
  }: SearchUserDto): Promise<
    PaginatedResponseDto<Prisma.UserGetPayload<object>>
  > {
    const where: Prisma.UserWhereInput = {
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const result: PaginatedResponseDto<Prisma.UserGetPayload<object>> = {
      message: 'Lấy danh sách người dùng thành công',
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return result;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createOrFindUser({
    email,
    name,
    googleId,
    avatarUrl,
  }: {
    email: string;
    name?: string;
    googleId?: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl,
          role: {
            connect: { name: 'user' },
          },
          status: {
            connect: { name: 'active' },
          },
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { email },
        data: { lastLoginAt: new Date() },
      });
    }
    return user;
  }
}
