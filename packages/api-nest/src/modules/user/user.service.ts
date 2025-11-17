import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { PrismaService } from "src/database/prisma.service";
import { userWithRoleSelect } from "./constants/user.select";
import { QueryUserDto } from "./dto/query-user.dto";

@Injectable()
export class UserService {
  private readonly prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

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
        select: userWithRoleSelect,
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

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userWithRoleSelect,
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    return user;
  }
}
