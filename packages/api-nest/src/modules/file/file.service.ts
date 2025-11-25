import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { PrismaService } from "src/database/prisma.service";
import { QueryFileDto } from "./dto/query-file.dto";
import type { UploadFileDto } from "./dto/upload-file.dto";

@Injectable()
export class FileService {
  private readonly prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async prepareUpload(userId: string, fileSize: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    });
    if (!user) {
      throw new BadRequestException("Người dùng không tồn tại");
    }
    const remaining = Number(user.storageLimit) - Number(user.storageUsed);
    if (fileSize > remaining) {
      return { canUpload: false, remainingStorage: remaining };
    }
    const uploadId = randomUUID();
    return {
      canUpload: true,
      remainingStorage: remaining - fileSize,
      uploadId,
    };
  }

  async createFile(ownerId: string, dto: UploadFileDto) {
    const file = await this.prisma.file.create({
      data: {
        ownerId,
        fileHash: dto.fileHash,
        cid: dto.cid,
        fileName: dto.fileName,
        fileSize: BigInt(dto.fileSize),
        fileType: dto.fileType ?? null,
        encryptedKeyOwner: dto.encryptedKeyOwner,
        metadata: dto.metadata ?? null,
      },
    });

    await this.prisma.user.update({
      where: { id: ownerId },
      data: { storageUsed: { increment: BigInt(dto.fileSize) } },
    });

    return { ...file, fileSize: file.fileSize.toString() };
  }

  async findAll(
    userId: string,
    {
      page = 1,
      limit = 20,
      type = "uploaded",
      search = "",
      sortBy = "uploadTimestamp",
      order = "desc",
    }: QueryFileDto
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.FileWhereInput = {
      status: { not: "deleted" },
    };
    if (search) {
      where.fileName = { contains: search, mode: "insensitive" };
    }
    if (type === "uploaded") {
      where.ownerId = userId;
    } else {
      where.grants = {
        some: {
          granteeId: userId,
          status: "active",
        },
      };
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          owner: { select: { id: true, username: true, walletAddress: true } },
          _count: { select: { grants: true, downloads: true } },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      files: files.map((f) => ({
        ...f,
        fileSize: f.fileSize.toString(),
        shares: f._count.grants,
        downloads: f._count.downloads,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        owner: { select: { id: true, username: true, walletAddress: true } },
        grants: {
          where: { status: "active" },
          include: {
            grantee: {
              select: { id: true, username: true, walletAddress: true },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException("File không tồn tại");
    }

    const isOwner = file.ownerId === userId;
    const hasGrant = file.grants.some((g) => g.granteeId === userId);

    if (!(isOwner || hasGrant)) {
      throw new ForbiddenException("Bạn không có quyền truy cập file này");
    }

    return {
      ...file,
      fileSize: file.fileSize.toString(),
      isOwner,
    };
  }

  async remove(userId: string, fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException("File không tồn tại");
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException("Bạn không phải chủ sở hữu file");
    }

    await this.prisma.file.update({
      where: { id: fileId },
      data: { status: "deleted" },
    });

    return { message: "Xóa file thành công" };
  }
}
