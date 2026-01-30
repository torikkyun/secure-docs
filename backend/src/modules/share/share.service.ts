import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { FileActivityAction } from "generated/prisma/enums";
import { FileActivityService } from "../file-activity/file-activity.service";

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileActivity: FileActivityService,
  ) {}

  async createShare({ fileId, recipients }: CreateShareDto, senderId: string) {
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

    // const recipientIds = recipients.map((r) => r.recipientId);

    // // Get recipients' public keys
    // const users = await this.prisma.user.findMany({
    //   where: {
    //     id: { in: recipientIds },
    //   },
    //   select: {
    //     id: true,
    //     publicKey: true,
    //   },
    // });

    // const publicKeys: Record<string, string> = {};
    // users.forEach((user) => {
    //   if (user.publicKey) {
    //     publicKeys[user.id] = user.publicKey;
    //   }
    // });

    // // Validate all recipients have public keys
    // const missingKeys = recipientIds.filter((id) => !publicKeys[id]);
    // if (missingKeys.length > 0) {
    //   throw new BadRequestException(
    //     `Không thể chia sẻ. Người nhận thiếu khóa công khai: ${missingKeys.join(", ")}`,
    //   );
    // }

    // // Create share records for each recipient
    // const shares: Array<{
    //   id: string;
    //   recipient: { id: string; name: string; email: string };
    //   createdAt: Date;
    // }> = [];

    // const errors: string[] = [];

    // for (const { recipientId, wrappedAesKey } of recipients) {
    //   try {
    //     // Check if share already exists
    //     const existingShare = await this.prisma.share.findUnique({
    //       where: {
    //         fileId_recipientId: {
    //           fileId,
    //           recipientId,
    //         },
    //       },
    //       include: {
    //         recipient: {
    //           select: {
    //             name: true,
    //             email: true,
    //           },
    //         },
    //       },
    //     });

    //     if (existingShare) {
    //       errors.push(
    //         `${existingShare.recipient.name} (${existingShare.recipient.email})`,
    //       );
    //       continue;
    //     }

    //     // Create new share with recipient-specific wrapped key
    //     const share = await this.prisma.share.create({
    //       data: {
    //         fileId,
    //         senderId,
    //         recipientId,
    //         wrappedAesKey, // Each recipient has their own wrapped key
    //       },
    //       include: {
    //         recipient: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //           },
    //         },
    //       },
    //     });

    //     shares.push({
    //       id: share.id,
    //       recipient: share.recipient,
    //       createdAt: share.createdAt,
    //     });
    //   } catch (error) {
    //     errors.push(`Có lỗi với người nhận ${recipientId}: ${error.message}`);
    //   }
    // }

    // // If all shares failed, throw error
    // if (shares.length === 0 && errors.length > 0) {
    //   throw new BadRequestException(
    //     `Không thể chia sẻ. ${errors.length > 0 ? `Đã chia sẻ cho: ${errors.join(", ")}` : ""}`,
    //   );
    // }

    // // Log share activity (conditionally log to blockchain based on file's setting)
    // // await this.logger.logFileActivity(
    // //   {
    // //     userId: senderId,
    // //     fileId,
    // //     action: FileActivityAction.SHARE,
    // //     metadata: {
    // //       recipientIds,
    // //       shareCount: shares.length,
    // //       errors: errors.length > 0 ? errors : undefined,
    // //     },
    // //   },
    // //   file?.enableBlockchainLogging ?? true, // Use file's blockchain logging preference
    // // );

    // return {
    //   fileId,
    //   shares,
    //   sharedAt: new Date(),
    //   warnings: errors.length > 0 ? errors : undefined,
    // };

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

    // Log share activity (conditionally log to blockchain based on file's setting)
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
      },
      file?.enableBlockchainLogging ?? true,
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

  // async getReceivedShares(userId: string): Promise<any[]> {
  //   const shares = await this.prisma.share.findMany({
  //     where: {
  //       recipientId: userId,
  //     },
  //     include: {
  //       file: {
  //         include: {
  //           owner: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //             },
  //           },
  //         },
  //       },
  //       sender: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });

  //   return shares.map((share) => ({
  //     id: share.id,
  //     file: {
  //       id: share.file.id,
  //       filename: share.file.filename,
  //       mimeType: share.file.mimeType,
  //       size: share.file.size.toString(),
  //       owner: share.file.owner,
  //     },
  //     sender: share.sender,
  //     sharedAt: share.createdAt,
  //   }));
  // }

  // async getSentShares(userId: string): Promise<any[]> {
  //   const shares = await this.prisma.share.findMany({
  //     where: {
  //       senderId: userId,
  //     },
  //     include: {
  //       file: {
  //         select: {
  //           id: true,
  //           filename: true,
  //           mimeType: true,
  //           size: true,
  //         },
  //       },
  //       recipient: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });

  //   return shares.map((share) => ({
  //     id: share.id,
  //     file: {
  //       id: share.file.id,
  //       filename: share.file.filename,
  //       mimeType: share.file.mimeType,
  //       size: share.file.size.toString(),
  //     },
  //     recipient: share.recipient,
  //     sharedAt: share.createdAt,
  //   }));
  // }

  // async revokeShare(shareId: string, userId: string): Promise<void> {
  //   // Find the share and verify ownership
  //   const share = await this.prisma.share.findFirst({
  //     where: {
  //       id: shareId,
  //       senderId: userId, // Only sender can revoke
  //     },
  //   });

  //   if (!share) {
  //     throw new NotFoundException("Share not found or access denied");
  //   }

  //   // Log share revocation
  //   // await this.logger.logFileActivity({
  //   //   userId,
  //   //   fileId: share.fileId,
  //   //   action: FileActivityAction.REVOKE_SHARE,
  //   //   metadata: {
  //   //     revokedShareId: shareId,
  //   //     recipientId: share.recipientId,
  //   //   },
  //   // });

  //   // Delete the share
  //   await this.prisma.share.delete({
  //     where: { id: shareId },
  //   });
  // }

  // async getShareById(shareId: string, userId: string): Promise<any> {
  //   const share = await this.prisma.share.findFirst({
  //     where: {
  //       id: shareId,
  //       OR: [{ senderId: userId }, { recipientId: userId }],
  //     },
  //     include: {
  //       file: {
  //         include: {
  //           owner: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //       },
  //       sender: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //         },
  //       },
  //       recipient: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!share) {
  //     throw new NotFoundException("Share not found or access denied");
  //   }

  //   return {
  //     id: share.id,
  //     file: {
  //       id: share.file.id,
  //       filename: share.file.filename,
  //       mimeType: share.file.mimeType,
  //       size: share.file.size.toString(),
  //       owner: share.file.owner,
  //     },
  //     sender: share.sender,
  //     recipient: share.recipient,
  //     wrappedAesKey: share.wrappedAesKey,
  //     sharedAt: share.createdAt,
  //   };
  // }
}
