import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { serializeBigInt } from 'src/common/utils/bigint.util';
import { getOffsetPagination } from 'src/common/utils/pagination.util';
import { PrismaService } from 'src/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { QueryFileDto } from './dto/query-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async prepareUpload(userId: string, fileSize: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
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
      fileName,
      originalFileName,
      filePath,
      fileSize,
      fileType,
      mimeType,
      fileHash,
      encryptedKeyOwner,
    }: UploadFileDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const status = await this.prisma.fileStatus.findUnique({
      where: { name: 'active' },
      select: { id: true },
    });

    if (!status) {
      throw new Error('Trạng thái file không tồn tại');
    }

    const file = await this.prisma.file.create({
      data: {
        ownerId,
        fileName,
        originalFileName,
        filePath,
        fileSize: BigInt(fileSize),
        fileType,
        mimeType,
        fileHash,
        encryptedKeyOwner,
        statusId: status.id,
      },
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        filePath: true,
        fileSize: true,
        fileType: true,
        mimeType: true,
        fileHash: true,
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
            email: true,
          },
        },
      },
    });

    await this.prisma.user.update({
      where: { id: ownerId },
      data: { storageUsed: { increment: BigInt(fileSize) } },
    });

    // Audit Log: FILE_UPLOAD
    await this.auditService.log({
      userId: ownerId,
      eventType: 'FILE_UPLOAD',
      fileId: file.id,
      eventData: {
        fileName: originalFileName,
        fileSize,
        fileType,
        mimeType,
      },
      ipAddress,
      userAgent,
    });

    return serializeBigInt(file);
  }

  async findAll(
    userId: string,
    userRole: string,
    {
      page = 1,
      limit = 20,
      type = 'uploaded',
      search = '',
      sortBy = 'uploadTimestamp',
      order = 'desc',
    }: QueryFileDto,
  ) {
    const { take, skip } = getOffsetPagination(page, limit);
    const where: Prisma.FileWhereInput = {
      status: { name: 'active' },
    };
    if (search) {
      where.fileName = { contains: search, mode: 'insensitive' };
    }

    // Admin can search all files, regular users are restricted
    const isAdmin = userRole === 'admin';

    if (type === 'all' && isAdmin) {
      // Admin searching all files - no owner/grantee filter
    } else if (type === 'uploaded') {
      where.ownerId = userId;
    } else if (type === 'received') {
      where.grants = {
        some: {
          granteeId: userId,
          status: { name: 'active' },
        },
      };
    } else if (!isAdmin) {
      // Non-admin users cannot use type="all", default to uploaded
      where.ownerId = userId;
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
          originalFileName: true,
          fileSize: true,
          fileType: true,
          mimeType: true,
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
              email: true,
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
        fileName: true,
        originalFileName: true,
        filePath: true,
        fileSize: true,
        fileType: true,
        mimeType: true,
        fileHash: true,
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
            email: true,
          },
        },
        grants: {
          where: { status: { name: 'active' } },
          select: {
            grantee: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });
    if (!file) {
      throw new NotFoundException('File không tồn tại');
    }
    const isOwner = file.owner.id === userId;
    const hasGrant = file.grants.some((g) => g.grantee.id === userId);
    if (!(isOwner || hasGrant)) {
      throw new ForbiddenException('Bạn không có quyền truy cập file này');
    }
    return {
      file: serializeBigInt(file),
      isOwner,
    };
  }

  async remove(
    userId: string,
    fileId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new NotFoundException('File không tồn tại');
    }
    if (file.ownerId !== userId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu file');
    }
    await this.prisma.file.update({
      where: { id: fileId },
      data: { status: { connect: { name: 'deleted' } } },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: file.fileSize } },
    });

    // Audit Log: FILE_DELETE
    await this.auditService.log({
      userId,
      eventType: 'FILE_DELETE',
      fileId,
      eventData: {
        fileName: file.fileName,
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Xóa file thành công' };
  }
}
