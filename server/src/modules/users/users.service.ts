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
import { Prisma } from 'generated/prisma';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { buildUserCreateAuditDetails } from './utils/user-create-audit-details.util';
import { Request } from 'express';
import { buildUserResponse } from './utils/user-response.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getUser(
    actorId: string,
    userId?: string,
  ): Promise<{ message: string; user: UserResponse }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId ?? actorId },
      select: UserSelect,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    await this.auditLogsService.create({
      targetType: 'user',
      status: 'success',
      actionType: 'user_getUser',
      actorId,
    });

    const userResponse: UserResponse = buildUserResponse(user);

    return {
      message: 'Lấy thông tin người dùng thành công',
      user: userResponse,
    };
  }

  async create(
    actorId: string,
    req: Request,
    { password, role, departmentCode, ...rest }: CreateUserDto,
  ): Promise<{ message: string; user: UserResponse }> {
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

      await this.auditLogsService.create({
        targetId: user.id,
        targetType: 'user',
        status: 'success',
        actionType: 'user_create',
        actorId: actorId,
        details: buildUserCreateAuditDetails({
          input: { ...rest, role, departmentCode },
          req,
        }),
      });

      return {
        message: 'Tạo người dùng thành công',
        user: buildUserResponse(user),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        await this.auditLogsService.create({
          targetType: 'user',
          status: 'failed',
          actionType: 'user_create',
          actorId: actorId,
          details: buildUserCreateAuditDetails({
            input: { ...rest, role, departmentCode },
            errorReason: 'Người dùng đã tồn tại',
            req,
          }),
        });
        throw new BadRequestException('Người dùng đã tồn tại');
      }
      throw error;
    }
  }

  async update(
    actorId: string,
    userId: string,
    { password, ...updateUserDto }: UpdateUserDto,
  ): Promise<{ message: string; user: UserResponse }> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateUserDto,
        ...(password && { passwordHash: await bcrypt.hash(password, 10) }),
      },
      select: UserSelect,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    await this.auditLogsService.create({
      targetId: userId,
      targetType: 'user',
      status: 'success',
      actionType: 'manage_account',
      actorId,
    });

    return {
      message: 'Cập nhật người dùng thành công',
      user: buildUserResponse(user),
    };
  }
}
