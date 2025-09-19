import { PrismaService } from '@core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { Prisma, User } from 'generated/prisma';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { AuthService } from '@core/auth/auth.service';
import { RedisService } from '@core/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  async register({
    email,
    password,
    name,
    age,
  }: RegisterUserDto): Promise<{ message: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        Profile: {
          create: { age },
        },
      },
    });

    return {
      message: 'Đăng ký tài khoản thành công',
      email,
    };
  }

  async login({ email, password }: LoginUserDto): Promise<{
    message: string;
    user: Omit<User, 'password'>;
    accessToken: string;
  }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...userData } = user;
      const accessToken = await this.authService.generateAccessToken(user);
      return { message: 'Đăng nhập thành công', user: userData, accessToken };
    }

    throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  }

  async findAll({
    email,
    page,
    limit,
    skip,
  }: SearchUserDto): Promise<
    PaginatedResponseDto<Omit<Prisma.UserGetPayload<object>, 'password'>>
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
        omit: { password: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    const result: PaginatedResponseDto<
      Omit<Prisma.UserGetPayload<object>, 'password'>
    > = {
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
}
