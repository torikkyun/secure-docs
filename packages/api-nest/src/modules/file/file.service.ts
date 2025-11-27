import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { serializeBigInt } from "src/common/utils/bigint.util";
import { getOffsetPagination } from "src/common/utils/pagination.util";
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
    const remaining = BigInt(user.storageLimit) - BigInt(user.storageUsed);
    const fileSizeBigInt = BigInt(fileSize);
    if (fileSizeBigInt > remaining) {
      return { canUpload: false, remainingStorage: serializeBigInt(remaining) };
    }
    const uploadId = randomUUID();
    return {
      canUpload: true,
      remainingStorage: serializeBigInt(remaining - fileSizeBigInt),
      uploadId,
    };
  }

  async createFile(
    ownerId: string,
    {
      fileHash,
      cid,
      fileName,
      fileSize,
      fileType,
      encryptedKeyOwner,
      pinSize,
      pinService,
    }: UploadFileDto
  ) {
    const [status, ipfsPinStatus] = await Promise.all([
      this.prisma.fileStatus.findUnique({
        where: { name: "active" },
        select: { id: true },
      }),
      this.prisma.ipfsPinStatus.findUnique({
        where: { name: "pinned" },
        select: { id: true },
      }),
    ]);
    if (!(status && ipfsPinStatus)) {
      throw new Error("Trạng thái file hoặc trạng thái pin không tồn tại");
    }
    const file = await this.prisma.file.create({
      data: {
        ownerId,
        fileHash,
        cid,
        fileName,
        fileSize: BigInt(fileSize),
        fileType,
        encryptedKeyOwner,
        statusId: status.id,
        ipfsPins: {
          create: {
            pinStatusId: ipfsPinStatus.id,
            pinSize: BigInt(pinSize),
            pinService,
          },
        },
      },
      select: {
        id: true,
        fileHash: true,
        cid: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        encryptedKeyOwner: true,
        uploadTimestamp: true,
        status: {
          select: {
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
        ipfsPins: {
          where: { pinStatus: { name: "pinned" } },
          select: {
            pinSize: true,
            pinService: true,
          },
        },
      },
    });
    await this.prisma.user.update({
      where: { id: ownerId },
      data: { storageUsed: { increment: BigInt(fileSize) } },
    });
    return serializeBigInt(file);
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
    const { take, skip } = getOffsetPagination(page, limit);
    const where: Prisma.FileWhereInput = {
      status: { name: "active" },
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
          status: { name: "active" },
        },
      };
    }
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          fileType: true,
          uploadTimestamp: true,
          status: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.file.count({ where }),
    ]);
    return {
      files: serializeBigInt(files),
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
      select: {
        id: true,
        fileHash: true,
        cid: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        encryptedKeyOwner: true,
        uploadTimestamp: true,
        status: {
          select: {
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
        grants: {
          where: { status: { name: "active" } },
          select: {
            grantee: {
              select: { id: true, username: true, walletAddress: true },
            },
          },
        },
        ipfsPins: {
          where: { pinStatus: { name: "pinned" } },
          select: { pinSize: true, pinService: true },
        },
      },
    });
    if (!file) {
      throw new NotFoundException("File không tồn tại");
    }
    const isOwner = file.owner.id === userId;
    const hasGrant = file.grants.some((g) => g.grantee.id === userId);
    if (!(isOwner || hasGrant)) {
      throw new ForbiddenException("Bạn không có quyền truy cập file này");
    }
    return {
      file: serializeBigInt(file),
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
      data: { status: { connect: { name: "deleted" } } },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: file.fileSize } },
    });
    return { message: "Xóa file thành công" };
  }
}
