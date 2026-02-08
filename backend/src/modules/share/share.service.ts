import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { FileActivityAction } from "generated/prisma/enums";
import { FileActivityService } from "../file-activity/file-activity.service";
import { Request } from "express";
import { CacheVersionService } from "src/infrastructure/cache/cache-version.service";

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileActivity: FileActivityService,
    private readonly cacheVersion: CacheVersionService,
  ) {}

  async createShare(
    { fileId, recipients }: CreateShareDto,
    senderId: string,
    req: Request,
  ) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: senderId,
      },
      select: {
        id: true,
        filename: true,
        enableBlockchainLogging: true,
      },
    });

    if (!file) {
      throw new NotFoundException("Không tìm thấy tệp hoặc quyền bị từ chối");
    }

    const recipientIds = [...new Set(recipients.map((r) => r.recipientId))];

    const users = await this.prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, publicKey: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const missingKeys = recipientIds.filter(
      (id) => !userMap.get(id)?.publicKey,
    );

    if (missingKeys.length) {
      throw new BadRequestException(
        "Một hoặc nhiều người nhận chưa sẵn sàng nhận file",
      );
    }

    const existingShares = await this.prisma.share.findMany({
      where: {
        fileId,
        recipientId: { in: recipientIds },
      },
      select: {
        recipientId: true,
        recipient: { select: { name: true, email: true } },
      },
    });

    const existingMap = new Map(existingShares.map((s) => [s.recipientId, s]));

    const toCreate = recipients.filter((r) => !existingMap.has(r.recipientId));

    if (toCreate.length === 0) {
      throw new BadRequestException(
        "Tệp đã được chia sẻ cho tất cả người nhận",
      );
    }

    const created = await this.prisma.$transaction(
      toCreate.map((r) =>
        this.prisma.share.create({
          data: {
            fileId,
            senderId,
            recipientId: r.recipientId,
            wrappedAesKey: r.wrappedAesKey,
          },
          select: {
            id: true,
            recipient: {
              select: { id: true, name: true, email: true },
            },
            createdAt: true,
          },
        }),
      ),
    );

    await this.fileActivity.logFileActivity(
      {
        userId: senderId,
        fileId,
        action: FileActivityAction.SHARE,
        metadata: {
          recipientIds,
          shareCount: created.length,
          errors: existingShares.length > 0 ? existingShares : undefined,
        },
        req,
      },
      file?.enableBlockchainLogging ?? true,
    );

    await this.cacheVersion.bump(`file-activity:user:${senderId}:version`);
    await this.cacheVersion.bump(`file-activity:file:${fileId}:version`);
    await this.cacheVersion.bump(`files:file:${fileId}:version`);

    await Promise.all(
      created.map((share) =>
        this.cacheVersion.bump(`files:user:${share.recipient.id}:version`),
      ),
    );

    return {
      fileId,
      shares: created,
      sharedAt: new Date(),
      warnings:
        existingShares.length > 0
          ? existingShares.map(
              (s) => `${s.recipient.name} (${s.recipient.email})`,
            )
          : undefined,
    };
  }
}
