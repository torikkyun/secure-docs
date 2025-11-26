import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import extractIpAndUserAgent from "src/common/utils/request.util";
import { PrismaService } from "src/database/prisma.service";
import { CompleteDownloadDto } from "./dto/complete-download.dto";
import { RequestDownloadDto } from "./dto/request-download.dto";

@Injectable()
export class DownloadService {
  private readonly prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async requestDownload(
    userId: string,
    { fileId }: RequestDownloadDto,
    req: Request
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        cid: true,
        fileHash: true,
        fileName: true,
        fileType: true,
        fileSize: true,
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
      throw new NotFoundException("Không tìm thấy file");
    }
    let accessGrantId: string | null = null;
    let encryptedKey = "";
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
      });

      if (!grant || grant.statusId !== "active") {
        throw new ForbiddenException(
          "Bạn không có quyền truy cập vào file này"
        );
      }
      if (grant.expiresAt && new Date() > grant.expiresAt) {
        throw new ForbiddenException("Quyền truy cập của bạn đã hết hạn");
      }
      accessGrantId = grant.id;
      encryptedKey = grant.encryptedKeyGrantee;
    }
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    const download = await this.prisma.download.create({
      data: {
        fileId,
        userId,
        accessGrantId,
        statusId: "pending",
        ipAddress,
        userAgent,
      },
    });

    return {
      downloadId: download.id,
      cid: file.cid,
      fileHash: file.fileHash,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize.toString(),
      encryptedKey,
      ownerPublicKey: file.owner.publicKey,
    };
  }

  async completeDownload(
    userId: string,
    downloadId: string,
    dto: CompleteDownloadDto
  ) {
    const download = await this.prisma.download.findUnique({
      where: { id: downloadId },
    });

    if (!download) {
      throw new NotFoundException("Download record not found");
    }

    if (download.userId !== userId) {
      throw new ForbiddenException("You cannot update this download record");
    }

    const updatedDownload = await this.prisma.download.update({
      where: { id: downloadId },
      data: {
        statusId: dto.success ? "success" : "failed",
        fileSizeDownloaded: dto.bytesDownloaded
          ? BigInt(dto.bytesDownloaded)
          : null,
        errorMessage: dto.errorMessage,
      },
    });

    return {
      success: true,
      downloadId: updatedDownload.id,
      status: updatedDownload.statusId,
    };
  }
}
