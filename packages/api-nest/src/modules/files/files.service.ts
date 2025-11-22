import { randomUUID } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import type { UploadFileDto } from "./dto/upload-file.dto";

@Injectable()
export class FilesService {
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
        txHash: dto.txHash ?? null,
        blockchainFileId: dto.blockchainFileId ?? null,
        metadata: dto.metadata ?? null,
      },
    });

    await this.prisma.user.update({
      where: { id: ownerId },
      data: { storageUsed: { increment: BigInt(dto.fileSize) } },
    });

    return { ...file, fileSize: file.fileSize.toString() };
  }
}
