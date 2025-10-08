import { PrismaService } from '@core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserSelect } from './utils/user-select.util';
import { UserResponse } from './types/user-reponse.type';
import { UserWithRoleAndManager } from './types/user-with-role-and-manager.type';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildUserResponse(user: UserWithRoleAndManager): UserResponse {
    return {
      id: user.id,
      staffId: user.staffId,
      name: user.name,
      department: user.department || null,
      role: user.Role.name,
      manager: user.Manager?.name || null,
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

  async create({ staffId, password, name, department, role }: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        staffId,
        passwordHash: await bcrypt.hash(password, 10),
        name,
        department,
        Role: {
          connect: { name: role },
        },
      },
      select: UserSelect,
    });

    return {
      message: 'Tạo người dùng thành công',
      user: this.buildUserResponse(user),
    };
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

    return {
      message: 'Cập nhật người dùng thành công',
      user: this.buildUserResponse(user),
    };
  }
}
