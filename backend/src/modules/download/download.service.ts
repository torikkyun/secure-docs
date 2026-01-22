import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Prisma } from 'generated/prisma/client';
import { serializeBigInt } from 'src/common/utils/bigint.util';
import { getOffsetPagination } from 'src/common/utils/pagination.util';
import extractIpAndUserAgent from 'src/common/utils/request.util';
import { PrismaService } from 'src/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CompleteDownloadDto } from './dto/complete-download.dto';
import { QueryDownloadDto } from './dto/query-download.dto';
import { RequestDownloadDto } from './dto/request-download.dto';

@Injectable()
export class DownloadService {
  private readonly prisma: PrismaService;
  private readonly auditService: AuditService;

  constructor(prisma: PrismaService, auditService: AuditService) {
    this.prisma = prisma;
    this.auditService = auditService;
  }

  async requestDownload(
    userId: string,
    { fileId }: RequestDownloadDto,
    req: Request,
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        filePath: true,
        fileType: true,
        mimeType: true,
        fileSize: true,
        fileHash: true,
        encryptedKeyOwner: true,
        ownerId: true,
        owner: {
          select: {
            publicKey: true,
          },
        },
      },
    });
    if (!file) {
      throw new NotFoundException('Không tìm thấy file');
    }
    let accessGrantId: string | null = null;
    let encryptedKey = '';
    if (file.ownerId === userId) {
      encryptedKey = file.encryptedKeyOwner;
    } else {
      const grant = await this.prisma.accessGrant.findUnique({
        where: {
          idx_unique_grant: {
            fileId,
            granteeId: userId,
          },
        },
        select: {
          id: true,
          status: {
            select: {
              id: true,
              name: true,
            },
          },
          expiresAt: true,
          encryptedKeyGrantee: true,
        },
      });
      if (!grant || grant.status.name !== 'active') {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập vào file này',
        );
      }
      if (grant.expiresAt && new Date() > grant.expiresAt) {
        throw new ForbiddenException('Quyền truy cập của bạn đã hết hạn');
      }
      accessGrantId = grant.id;
      encryptedKey = grant.encryptedKeyGrantee;
    }
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    const status = await this.prisma.downloadStatus.findUnique({
      where: { name: 'pending' },
    });
    if (!status) {
      throw new NotFoundException('Không tìm thấy trạng thái download');
    }
    const download = await this.prisma.download.create({
      data: {
        fileId,
        userId,
        accessGrantId,
        statusId: status.id,
        ipAddress,
        userAgent,
      },
    });

    // Audit Log: FILE_DOWNLOAD
    await this.auditService.log({
      userId,
      eventType: 'FILE_DOWNLOAD',
      fileId,
      eventData: {
        fileName: file.originalFileName,
        downloadId: download.id,
      },
      ipAddress,
      userAgent,
    });

    return {
      downloadId: download.id,
      filePath: file.filePath,
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      fileType: file.fileType,
      mimeType: file.mimeType,
      fileSize: file.fileSize.toString(),
      fileHash: file.fileHash,
      encryptedKey,
      ownerPublicKey: file.owner.publicKey,
    };
  }

  async completeDownload(
    userId: string,
    downloadId: string,
    { success, errorMessage }: CompleteDownloadDto,
  ) {
    const download = await this.prisma.download.findUnique({
      where: { id: downloadId },
    });
    if (!download) {
      throw new NotFoundException('Không tìm thấy bản ghi download');
    }
    if (download.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật bản ghi download',
      );
    }
    const status = await this.prisma.downloadStatus.findUnique({
      where: { name: success ? 'success' : 'failed' },
    });
    if (!status) {
      throw new NotFoundException('Không tìm thấy trạng thái download');
    }
    const updatedDownload = await this.prisma.download.update({
      where: { id: downloadId },
      data: {
        statusId: status.id,
        errorMessage,
      },
    });
    return {
      downloadId: updatedDownload.id,
      status: updatedDownload.statusId,
    };
  }

  async findAll(
    userId: string,
    { search, page = 1, limit = 10 }: QueryDownloadDto,
  ) {
    const { take, skip } = getOffsetPagination(page, limit);
    const where: Prisma.DownloadWhereInput = {
      userId,
    };
    if (search) {
      where.OR = [
        {
          file: {
            fileName: {
              contains: search,
            },
          },
        },
      ];
    }
    const [downloads, total] = await Promise.all([
      this.prisma.download.findMany({
        where,
        select: {
          id: true,
          downloadTimestamp: true,
          errorMessage: true,
          ipAddress: true,
          status: {
            select: {
              id: true,
              name: true,
            },
          },
          file: {
            select: {
              id: true,
              fileName: true,
              originalFileName: true,
              fileType: true,
              mimeType: true,
              fileSize: true,
            },
          },
        },
        orderBy: {
          downloadTimestamp: 'desc',
        },
        take,
        skip,
      }),
      this.prisma.download.count({ where }),
    ]);

    return {
      downloads: serializeBigInt(downloads),
      total,
      page,
      limit,
    };
  }

  async findById(userId: string, id: string) {
    const download = await this.prisma.download.findUnique({
      where: { id, userId },
      select: {
        id: true,
        downloadTimestamp: true,
        errorMessage: true,
        ipAddress: true,
        userAgent: true,
        status: {
          select: {
            id: true,
            name: true,
          },
        },
        file: {
          select: {
            id: true,
            fileName: true,
            originalFileName: true,
            fileType: true,
            mimeType: true,
            fileSize: true,
          },
        },
        accessGrant: {
          select: {
            id: true,
            grantor: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
            status: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!download) {
      throw new NotFoundException('Không tìm thấy bản ghi download');
    }

    return serializeBigInt(download);
  }
}
