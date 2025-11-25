import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CompleteDownloadDto } from "./dto/complete-download.dto";
import { RequestDownloadDto } from "./dto/request-download.dto";

@Injectable()
export class DownloadService {
  private readonly prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async requestDownload(userId: string, dto: RequestDownloadDto) {
    const { fileId } = dto;

    // 1. Find file and check existence
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        owner: true,
      },
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    // 2. Check permissions
    let accessGrantId: string | null = null;
    let encryptedKey = "";

    if (file.ownerId === userId) {
      // User is owner
      encryptedKey = file.encryptedKeyOwner;
    } else {
      // Check for active grant
      const grant = await this.prisma.accessGrant.findUnique({
        where: {
          idx_unique_grant: {
            fileId,
            granteeId: userId,
          },
        },
      });

      if (!grant || grant.status !== "active") {
        throw new ForbiddenException(
          "You do not have permission to download this file"
        );
      }

      // Check expiration
      if (grant.expiresAt && new Date() > grant.expiresAt) {
        throw new ForbiddenException("Access grant has expired");
      }

      accessGrantId = grant.id;
      encryptedKey = grant.encryptedKeyGrantee;
    }

    // 3. Create download record
    const download = await this.prisma.download.create({
      data: {
        fileId,
        userId,
        accessGrantId,
        status: "pending", // Using "pending" to indicate start
        ipAddress: null, // Could capture from request if available
        userAgent: null, // Could capture from request if available
      },
    });

    return {
      downloadId: download.id,
      cid: file.cid,
      fileHash: file.fileHash,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize.toString(), // Serialize BigInt
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
        status: dto.success ? "success" : "failed",
        fileSizeDownloaded: dto.bytesDownloaded
          ? BigInt(dto.bytesDownloaded)
          : null,
        errorMessage: dto.errorMessage,
      },
    });

    return {
      success: true,
      downloadId: updatedDownload.id,
      status: updatedDownload.status,
    };
  }
}
