import { BadRequestException, Injectable, Version } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "@/database/prisma.service";
import { getOffsetPagination } from "@/common/utils/pagination.util";
import {
  BlockchainLogShareEvent,
  BlockchainLogDownloadEvent,
  BlockchainLogViewEvent,
} from "@/infrastructure/blockchain/events/blockchain-log.event";
import { getIpAddress, getUserAgent } from "@/common/utils/request.util";
import { Request } from "express";
import { QueryFileActivityDto } from "./dto/query-file-activity.dto";
import { VersionedCache } from "@/infrastructure/cache/decorators/versioned-cache.decorator";
import { FileActivityAction } from "@/prisma/enums";

@Injectable()
export class FileActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async logFileActivity(
    activity: {
      userId: string;
      fileId: string;
      action: FileActivityAction;
      metadata?: Record<string, any>;
      req: Request;
    },
    enableBlockchainLogging: boolean = true,
  ) {
    const { userId, fileId, action, metadata, req } = activity;

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    const createdActivity = await this.prisma.fileActivity.create({
      data: {
        userId,
        fileId,
        action: action,
        metadata: metadata || {},
        ipAddress,
        userAgent,
      },
    });

    if (enableBlockchainLogging && this.shouldLogToBlockchain(action)) {
      this.emitBlockchainEvent(createdActivity.id, activity);
    }

    return createdActivity;
  }

  private shouldLogToBlockchain(action: FileActivityAction): boolean {
    // Based on requirements:
    // - Upload: No blockchain logging
    // - Share: Optional blockchain logging (configurable)
    // - Download: Log when downloaded (for tracking)
    // - View: Log when viewed (for tracking)
    // - Delete/Revoke: No blockchain logging

    return (
      action === FileActivityAction.SHARE ||
      action === FileActivityAction.DOWNLOAD ||
      action === FileActivityAction.VIEW
    );
  }

  private emitBlockchainEvent(
    activityId: string,
    activity: {
      userId: string;
      fileId: string;
      action: FileActivityAction;
      metadata?: Record<string, any>;
    },
  ) {
    const { fileId, userId, action, metadata } = activity;
    const timestamp = Math.floor(Date.now() / 1000);

    if (action === FileActivityAction.SHARE) {
      const event = new BlockchainLogShareEvent(
        activityId,
        fileId,
        userId,
        metadata?.recipientIds || [],
        timestamp,
        metadata?.expiresAt ?? 0,
      );
      this.eventEmitter.emit("blockchain.log.share", event);
    } else if (action === FileActivityAction.DOWNLOAD) {
      const event = new BlockchainLogDownloadEvent(
        activityId,
        fileId,
        userId,
        timestamp,
      );
      this.eventEmitter.emit("blockchain.log.download", event);
    } else if (action === FileActivityAction.VIEW) {
      const event = new BlockchainLogViewEvent(
        activityId,
        fileId,
        userId,
        timestamp,
      );
      this.eventEmitter.emit("blockchain.log.view", event);
    }
  }

  @VersionedCache({
    prefix: "file-activity:user",
    versionKey: (args) => `file-activity:user:${args[0]}:version`,
    ttl: 300000,
  })
  async getUserFileActivities(
    userId: string,
    { page = 1, limit = 20 }: QueryFileActivityDto,
  ) {
    const { take, skip } = getOffsetPagination(page, limit);

    const [activities, total, actionGroups] = await Promise.all([
      this.prisma.fileActivity.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          file: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      this.prisma.fileActivity.count({ where: { userId } }),
      this.prisma.fileActivity.groupBy({
        by: ["action"],
        where: { userId },
        _count: { action: true },
      }),
    ]);

    const stats = actionGroups.reduce(
      (acc, g) => {
        acc[g.action] = g._count.action;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Enrich activities with additional data
    const enrichedActivities = await Promise.all(
      activities.map((activity) => this.enrichActivity(activity)),
    );

    return {
      data: enrichedActivities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  }

  /**
   * Get file activities for a specific file with pagination
   */
  @VersionedCache({
    prefix: "file-activity:file",
    versionKey: (args) => `file-activity:file:${args[0]}:version`,
    ttl: 300000,
  })
  async getFileActivities(
    fileId: string,
    { page = 1, limit = 50 }: QueryFileActivityDto,
    userId: string,
  ) {
    const hasAccess = await this.verifyFileAccess(fileId, userId);
    if (!hasAccess) {
      throw new BadRequestException(
        "Bạn không có quyền xem hoạt động của file này",
      );
    }

    const { take, skip } = getOffsetPagination(page, limit);

    const [activities, total] = await Promise.all([
      this.prisma.fileActivity.findMany({
        where: { fileId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          file: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      this.prisma.fileActivity.count({ where: { fileId } }),
    ]);

    const enrichedActivities = await Promise.all(
      activities.map((activity) => this.enrichActivity(activity)),
    );

    return {
      data: enrichedActivities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Enrich activity with action-specific data
   */
  private async enrichActivity(activity: any) {
    const baseActivity = {
      id: activity.id,
      action: activity.action,
      user: activity.user,
      file: activity.file,
      blockchainTxHash: activity.blockchainTxHash,
      createdAt: activity.createdAt,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
    };

    if (activity.action === FileActivityAction.SHARE) {
      const recipientIds = activity.metadata?.recipientIds || [];
      const recipients = await this.prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });

      return {
        ...baseActivity,
        recipients,
        shareCount: activity.metadata?.shareCount || recipientIds.length,
        warnings: activity.metadata?.errors
          ? activity.metadata.errors.map(
              (e: any) => `${e.recipient.name} (${e.recipient.email})`,
            )
          : undefined,
      };
    }

    if (activity.action === FileActivityAction.DOWNLOAD) {
      return {
        ...baseActivity,
        downloadedBy: activity.user,
        filename: activity.metadata?.filename,
      };
    }

    if (activity.action === FileActivityAction.VIEW) {
      return {
        ...baseActivity,
        viewedByOwner: activity.metadata?.viewedByOwner ?? false,
      };
    }

    return baseActivity;
  }

  private async verifyFileAccess(
    fileId: string,
    userId: string,
  ): Promise<boolean> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        OR: [
          { ownerId: userId },
          { shares: { some: { recipientId: userId } } },
        ],
      },
    });

    return !!file;
  }
}
