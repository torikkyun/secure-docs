import { PrismaService } from '@core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { Prisma, User } from 'generated/prisma';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { AuthenticationService } from '@core/authentication/authentication.service';
import { userSelect } from './utils/user-select';
import { UserResponse } from './types/user-response.type';

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
  }: SearchUserDto): Promise<PaginatedResponseDto<UserResponse>> {
    const where: Prisma.UserWhereInput = email
      ? { email: { contains: email, mode: 'insensitive' } }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: userSelect,
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách người dùng thành công',
      data: users.map((user) => this.buildUserResponse(user)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      message: 'Lấy thông tin người dùng thành công',
      user: this.buildUserResponse(user),
    };
  }

  private async createUser(data: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<
    User & {
      role: { id: string; name: string };
      status: { id: string; name: string };
    }
  > {
    const user = await this.prisma.user.create({
      data: {
        ...data,
        role: { connect: { name: 'user' } },
        status: { connect: { name: 'active' } },
        lastLoginAt: new Date(),
      },
      include: { role: true, status: true },
    });
    return user;
  }

  private async updateUserLastLogin(email: string): Promise<
    User & {
      role: { id: string; name: string };
      status: { id: string; name: string };
    }
  > {
    const user = await this.prisma.user.update({
      where: { email },
      data: { lastLoginAt: new Date() },
      include: { role: true, status: true },
    });
    return user;
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
  }): Promise<{
    message: string;
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
  }> {
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, status: true },
    });

    if (!user) {
      user = await this.createUser({ email, name, googleId, avatarUrl });
    } else {
      user = await this.updateUserLastLogin(email);
    }

    if (!user) {
      throw new NotFoundException('Không thể đăng nhập hoặc tạo người dùng');
    }

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    return {
      message: 'Đăng nhập thành công',
      user: this.buildUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  private buildUserResponse(
    user:
      | (User & {
          role: { id: string; name: string };
          status: { id: string; name: string };
        })
      | UserResponse,
  ): UserResponse {
    return {
      id: user.id,
      email: user.email,
      googleId: user.googleId,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      status: {
        id: user.status.id,
        name: user.status.name,
      },
    };
  }
}
