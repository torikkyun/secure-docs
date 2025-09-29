import { PrismaService } from '@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { Prisma } from 'generated/prisma';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { AuthenticationService } from '@core/authentication/authentication.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthenticationService,
  ) {}

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
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          lastLoginAt: true,
          role: {
            select: { id: true, name: true },
          },
          status: {
            select: { id: true, name: true },
          },
          googleId: true,
        },
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const result: PaginatedResponseDto = {
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

  async login({
    email,
    name,
    googleId,
    avatarUrl,
  }: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        status: true,
      },
    });
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
        include: {
          role: true,
          status: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { email },
        data: { lastLoginAt: new Date() },
        include: {
          role: true,
          status: true,
        },
      });
    }

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        role: { id: user.role.id, name: user.role.name },
        status: { id: user.status.id, name: user.status.name },
      },
      accessToken,
      refreshToken,
    };
  }
}
