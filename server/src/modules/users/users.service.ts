import { PrismaService } from '@core/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserSelect } from './utils/user-select.util';
import { UserResponse } from './types/user-reponse.type';
import { UserDetail } from './types/user-detail.type';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildUserResponse(user: UserDetail): UserResponse {
    return {
      id: user.id,
      staffId: user.staffId,
      name: user.name,
      role: user.Role.name,
      department: {
        code: user.Department.code,
        name: user.Department.name,
      },
      status: user.Status.name,
    };
  }

  async getUser(id: string): Promise<{ message: string; user: UserResponse }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: UserSelect,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const userResponse: UserResponse = this.buildUserResponse(user);

    return {
      message: 'Lấy thông tin người dùng thành công',
      user: userResponse,
    };
  }

  async create({ password, role, departmentCode, ...rest }: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          passwordHash: await bcrypt.hash(password, 10),
          Role: {
            connect: { name: role },
          },
          Department: { connect: { code: departmentCode } },
          Status: { connect: { name: 'active' } },
        },
        select: UserSelect,
      });

      return {
        message: 'Tạo người dùng thành công',
        user: this.buildUserResponse(user),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Người dùng đã tồn tại');
      }
      throw error;
    }
  }

  async update(id: string, { password, ...updateUserDto }: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(password && { passwordHash: await bcrypt.hash(password, 10) }),
      },
      select: UserSelect,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      message: 'Cập nhật người dùng thành công',
      user: this.buildUserResponse(user),
    };
  }
}
