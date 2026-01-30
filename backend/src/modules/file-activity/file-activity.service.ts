import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileActivityAction } from "generated/prisma/enums";
import { PrismaService } from "src/database/prisma.service";
import { BlockchainService } from "src/infrastructure/blockchain/blockchain.service";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import {
  BlockchainLogShareEvent,
  BlockchainLogDownloadEvent,
} from "src/infrastructure/blockchain/events/blockchain-log.event";

@Injectable()
export class FileActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async logFileActivity(
    activity: {
      userId: string;
      fileId: string;
      action: FileActivityAction;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    },
    enableBlockchainLogging: boolean = true,
  ) {
    const { userId, fileId, action, metadata, ipAddress, userAgent } = activity;

    // Always log to internal database first (fast, critical)
    const createdActivity = await this.prisma.fileActivity.create({
      data: {
        userId,
        fileId,
        action: action as any,
        metadata: metadata || {},
        ipAddress,
        userAgent,
      },
    });

    // Emit blockchain event asynchronously (fire-and-forget, non-blocking)
    if (
      enableBlockchainLogging &&
      this.shouldLogToBlockchain(action) &&
      this.blockchainService?.isEnabled()
    ) {
      this.emitBlockchainEvent(createdActivity.id, activity);
    }

    return createdActivity;
  }

  private shouldLogToBlockchain(action: FileActivityAction): boolean {
    // Based on requirements:
    // - Upload: No blockchain logging
    // - Share: Optional blockchain logging (configurable)
    // - Download: Log when downloaded (for tracking)
    // - Delete/Revoke: No blockchain logging

    return (
      action === FileActivityAction.SHARE ||
      action === FileActivityAction.DOWNLOAD
    );
  }

  /**
   * Emit blockchain event asynchronously (fire-and-forget)
   * This doesn't block the main request flow
   */
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
    }
  }

  /**
   * Get file activities for a user with pagination
   */
  async getUserFileActivities(
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  ) {
    const { take, skip } = getOffsetPagination(page, limit);

    const [activities, total] = await Promise.all([
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
    ]);

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
    };
  }

  /**
   * Get file activities for a specific file with pagination
   */
  async getFileActivities(
    fileId: string,
    { page = 1, limit = 50 }: { page?: number; limit?: number } = {},
  ) {
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

    // Enrich SHARE action with recipient details
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

    // Enrich DOWNLOAD action
    if (activity.action === FileActivityAction.DOWNLOAD) {
      return {
        ...baseActivity,
        downloadedBy: activity.user,
        filename: activity.metadata?.filename,
      };
    }

    // Enrich UPLOAD action
    if (activity.action === FileActivityAction.UPLOAD) {
      return {
        ...baseActivity,
        filename: activity.metadata?.filename,
        mimeType: activity.metadata?.mimeType,
        size: activity.metadata?.size,
      };
    }

    // Return base activity for other actions
    return baseActivity;
  }
}
