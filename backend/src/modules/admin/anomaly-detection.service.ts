import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "@/database/prisma.service";
import {
  AlertLevel,
  AlertType,
  FileActivityAction,
  FileClassification,
} from "@/prisma/enums";

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runDetection() {
    this.logger.log("Running anomaly detection...");
    await Promise.all([
      this.runZScoreDetection(),
      this.runRuleBasedDetection(),
    ]);
    this.logger.log("Anomaly detection completed.");
  }

  // ─── Z-Score Statistical Detection ───────────────────────────────────────────

  private async runZScoreDetection() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all users with activity in last 30 days
    const activeUserIds = await this.prisma.fileActivity.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const { userId } of activeUserIds) {
      await this.checkUserZScore(userId, now, oneHourAgo, thirtyDaysAgo);
    }
  }

  private async checkUserZScore(
    userId: string,
    now: Date,
    oneHourAgo: Date,
    thirtyDaysAgo: Date,
  ) {
    const actionsToCheck: FileActivityAction[] = [
      FileActivityAction.DOWNLOAD,
      FileActivityAction.VIEW,
      FileActivityAction.SHARE,
    ];

    for (const action of actionsToCheck) {
      // Baseline: daily counts over last 30 days
      const historicalActivities = await this.prisma.fileActivity.findMany({
        where: {
          userId,
          action,
          createdAt: { gte: thirtyDaysAgo, lt: oneHourAgo },
        },
        select: { createdAt: true },
      });

      if (historicalActivities.length < 5) continue; // not enough data

      // Group into daily buckets
      const dailyCounts = new Map<string, number>();
      for (const activity of historicalActivities) {
        const day = activity.createdAt.toISOString().slice(0, 10);
        dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
      }

      const counts = Array.from(dailyCounts.values());
      const mean = counts.reduce((sum, c) => sum + c, 0) / counts.length;
      const variance =
        counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) /
        counts.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev === 0) continue;

      // Current 1-hour count (scale to daily equivalent for fair comparison)
      const currentCount = await this.prisma.fileActivity.count({
        where: { userId, action, createdAt: { gte: oneHourAgo } },
      });

      // Scale hourly to daily (multiply by 24)
      const dailyEquivalent = currentCount * 24;
      const zScore = (dailyEquivalent - mean) / stdDev;

      if (Math.abs(zScore) > 3.5) {
        await this.createAlertIfNotDuplicate(
          userId,
          AlertLevel.ALERT,
          AlertType.STATISTICAL,
          {
            action,
            currentCount,
            zScore: Math.round(zScore * 100) / 100,
            mean: Math.round(mean * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
          },
          `Hành vi bất thường nghiêm trọng (Z=${zScore.toFixed(2)}): ${currentCount} lần ${action} trong 1 giờ`,
        );
      } else if (Math.abs(zScore) > 2.5) {
        await this.createAlertIfNotDuplicate(
          userId,
          AlertLevel.WARNING,
          AlertType.STATISTICAL,
          {
            action,
            currentCount,
            zScore: Math.round(zScore * 100) / 100,
            mean: Math.round(mean * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
          },
          `Hành vi bất thường (Z=${zScore.toFixed(2)}): ${currentCount} lần ${action} trong 1 giờ`,
        );
      }
    }
  }

  // ─── Rule-based Policy Violation ─────────────────────────────────────────────

  private async runRuleBasedDetection() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    await Promise.all([
      this.checkDownloadSpike(now, oneHourAgo),
      this.checkAfterHoursAccess(now, oneHourAgo),
      this.checkConfidentialShareOutsideGroup(now, oneHourAgo),
    ]);
  }

  // Rule 1: Download > 20 files in 1 hour → ALERT
  private async checkDownloadSpike(now: Date, oneHourAgo: Date) {
    const downloads = await this.prisma.fileActivity.groupBy({
      by: ["userId"],
      where: {
        action: FileActivityAction.DOWNLOAD,
        createdAt: { gte: oneHourAgo },
      },
      _count: { userId: true },
      having: { userId: { _count: { gt: 20 } } },
    });

    for (const { userId, _count } of downloads) {
      await this.createAlertIfNotDuplicate(
        userId,
        AlertLevel.ALERT,
        AlertType.POLICY,
        { downloadCount: _count.userId, windowMinutes: 60 },
        `Tải xuống ${_count.userId} file trong vòng 1 giờ (vượt ngưỡng cho phép 20)`,
      );
    }
  }

  // Rule 2: Access before 07:00 or after 22:00 → WARNING
  private async checkAfterHoursAccess(now: Date, oneHourAgo: Date) {
    const hour = now.getHours();
    if (hour >= 7 && hour < 22) return; // within business hours

    const activities = await this.prisma.fileActivity.findMany({
      where: {
        action: { in: [FileActivityAction.DOWNLOAD, FileActivityAction.VIEW] },
        createdAt: { gte: oneHourAgo },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const { userId } of activities) {
      await this.createAlertIfNotDuplicate(
        userId,
        AlertLevel.WARNING,
        AlertType.POLICY,
        { accessHour: hour },
        `Truy cập file ngoài giờ làm việc (${hour}:00)`,
      );
    }
  }

  // Rule 3: Share CONFIDENTIAL file to user outside sender's group → WARNING
  private async checkConfidentialShareOutsideGroup(
    now: Date,
    oneHourAgo: Date,
  ) {
    const confidentialShares = await this.prisma.share.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
        file: { classification: FileClassification.CONFIDENTIAL },
      },
      select: {
        senderId: true,
        recipientId: true,
        fileId: true,
        file: { select: { filename: true } },
      },
    });

    for (const share of confidentialShares) {
      // Check if recipient is in any of the sender's groups
      const senderGroups = await this.prisma.group.findMany({
        where: { createdById: share.senderId },
        select: { id: true },
      });

      if (senderGroups.length === 0) {
        await this.createAlertIfNotDuplicate(
          share.senderId,
          AlertLevel.WARNING,
          AlertType.POLICY,
          { fileId: share.fileId, recipientId: share.recipientId },
          `Chia sẻ file CONFIDENTIAL "${share.file.filename}" cho người dùng bên ngoài nhóm`,
        );
        continue;
      }

      const groupIds = senderGroups.map((g) => g.id);
      const isMember = await this.prisma.groupMember.findFirst({
        where: {
          groupId: { in: groupIds },
          userId: share.recipientId,
        },
      });

      if (!isMember) {
        await this.createAlertIfNotDuplicate(
          share.senderId,
          AlertLevel.WARNING,
          AlertType.POLICY,
          { fileId: share.fileId, recipientId: share.recipientId },
          `Chia sẻ file CONFIDENTIAL "${share.file.filename}" cho người dùng bên ngoài nhóm`,
        );
      }
    }
  }

  private async createAlertIfNotDuplicate(
    userId: string,
    level: AlertLevel,
    type: AlertType,
    metadata: Record<string, unknown>,
    description: string,
  ) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const existing = await this.prisma.anomalyAlert.findFirst({
      where: {
        userId,
        level,
        type,
        description,
        isResolved: false,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (existing) return;

    await this.prisma.anomalyAlert.create({
      data: { userId, level, type, description, metadata: metadata as object },
    });
  }
}
