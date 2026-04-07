import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "@/database/prisma.service";
import { BlockchainService } from "../blockchain.service";
import {
  BlockchainLogShareEvent,
  BlockchainLogDownloadEvent,
  BlockchainLogViewEvent,
} from "../events/blockchain-log.event";

@Injectable()
export class BlockchainEventListener {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent("blockchain.log.share", { async: true })
  async handleFileShareLog(event: BlockchainLogShareEvent) {
    const sender = await this.prisma.user.findUnique({
      where: { id: event.senderId },
      select: { email: true },
    });

    if (!sender?.email) {
      return;
    }

    const recipients = await this.prisma.user.findMany({
      where: { id: { in: event.recipientIds } },
      select: { id: true, email: true },
    });

    if (recipients.length === 0) {
      return;
    }

    // Send one transaction per recipient
    const txHashes: string[] = [];
    for (const recipient of recipients) {
      const txHash = await this.blockchainService.logFileShare({
        fileId: event.fileId,
        senderEmail: sender.email,
        recipientEmail: recipient.email,
        expiresAt: event.expiresAt,
        timestamp: event.timestamp,
      });
      if (txHash) {
        txHashes.push(txHash);
      }
    }

    if (txHashes.length > 0) {
      await this.prisma.fileActivity.update({
        where: { id: event.activityId },
        data: { blockchainTxHash: txHashes.join(",") },
      });
    }
  }

  @OnEvent("blockchain.log.download", { async: true })
  async handleFileDownloadLog(event: BlockchainLogDownloadEvent) {
    const user = await this.prisma.user.findUnique({
      where: { id: event.recipientId },
      select: { email: true },
    });

    if (!user?.email) {
      return;
    }

    const txHash = await this.blockchainService.logFileDownload({
      fileId: event.fileId,
      recipientEmail: user.email,
      timestamp: event.timestamp,
    });

    if (txHash) {
      await this.prisma.fileActivity.update({
        where: { id: event.activityId },
        data: { blockchainTxHash: txHash },
      });
    }
  }

  @OnEvent("blockchain.log.view", { async: true })
  async handleFileViewLog(event: BlockchainLogViewEvent) {
    const user = await this.prisma.user.findUnique({
      where: { id: event.viewerId },
      select: { email: true },
    });

    if (!user?.email) {
      return;
    }

    const txHash = await this.blockchainService.logFileView({
      fileId: event.fileId,
      viewerEmail: user.email,
      timestamp: event.timestamp,
    });

    if (txHash) {
      await this.prisma.fileActivity.update({
        where: { id: event.activityId },
        data: { blockchainTxHash: txHash },
      });
    }
  }
}
