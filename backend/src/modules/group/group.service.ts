import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { QueryGroupDto } from "./dto/query-group.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { getOffsetPagination } from "@/common/utils/pagination.util";
import { Prisma } from "@/prisma/client";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCanManage(
    groupId: string,
    userId: string,
    roleName: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, createdById: true },
    });

    if (!group) {
      throw new NotFoundException("Không tìm thấy nhóm");
    }

    if (roleName === "admin") return group;

    if (group.createdById !== userId) {
      throw new ForbiddenException("Bạn không có quyền quản lý nhóm này");
    }

    return group;
  }

  async createGroup(dto: CreateGroupDto, userId: string) {
    const existing = await this.prisma.group.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException("Tên nhóm đã tồn tại");
    }

    return this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async findAll(
    { page = 1, limit = 10, search, memberId }: QueryGroupDto,
    userId: string,
    roleName: string,
  ) {
    const { take, skip } = getOffsetPagination(page, limit);

    const where: Prisma.GroupWhereInput = {
      ...(search
        ? {
            name: { contains: search, mode: "insensitive" as Prisma.QueryMode },
          }
        : {}),
      ...(roleName === "user"
        ? { members: { some: { userId } } }
        : memberId
          ? { members: { some: { userId: memberId } } }
          : {}),
      ...(roleName === "manager" ? { createdById: userId } : {}),
    };

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      groups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                publicKey: true,
                role: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("Không tìm thấy nhóm");
    }

    return {
      ...group,
      members: group.members.map((m) => m.user),
    };
  }

  async updateGroup(
    id: string,
    dto: UpdateGroupDto,
    userId: string,
    roleName: string,
  ) {
    await this.assertCanManage(id, userId, roleName);

    if (dto.name) {
      const existing = await this.prisma.group.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException("Tên nhóm đã tồn tại");
      }
    }

    return this.prisma.group.update({
      where: { id },
      data: dto,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async deleteGroup(id: string, userId: string, roleName: string) {
    await this.assertCanManage(id, userId, roleName);

    await this.prisma.group.delete({ where: { id } });

    return { message: "Xóa nhóm thành công" };
  }

  async addMember(
    groupId: string,
    { userId: memberId }: AddMemberDto,
    userId: string,
    roleName: string,
  ) {
    await this.assertCanManage(groupId, userId, roleName);

    const user = await this.prisma.user.findUnique({
      where: { id: memberId, isDeleted: false },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: memberId } },
    });

    if (existing) {
      throw new ConflictException("Người dùng đã là thành viên của nhóm");
    }

    await this.prisma.groupMember.create({
      data: { groupId, userId: memberId },
    });

    return { message: `Đã thêm ${user.name} vào nhóm` };
  }

  async removeMember(
    groupId: string,
    memberId: string,
    userId: string,
    roleName: string,
  ) {
    await this.assertCanManage(groupId, userId, roleName);

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: memberId } },
    });

    if (!existing) {
      throw new NotFoundException("Người dùng không thuộc nhóm này");
    }

    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: memberId } },
    });

    return { message: "Đã xóa thành viên khỏi nhóm" };
  }
}
