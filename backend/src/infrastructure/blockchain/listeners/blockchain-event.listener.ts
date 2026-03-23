import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "src/database/prisma.service";
import { BlockchainService } from "../blockchain.service";
import {
  BlockchainLogShareEvent,
  BlockchainLogDownloadEvent,
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

    const recipientEmails = recipients.map((r) => r.email);

    if (recipientEmails.length === 0) {
      return;
    }

    const txHash = await this.blockchainService.logFileShare({
      fileId: event.fileId,
      senderEmail: sender.email,
      recipientEmails,
      timestamp: event.timestamp,
    });

    if (txHash) {
      await this.prisma.fileActivity.update({
        where: { id: event.activityId },
        data: { blockchainTxHash: txHash },
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
}
