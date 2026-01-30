import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "src/database/prisma.service";
import { BlockchainService } from "../blockchain.service";
import {
  BlockchainLogShareEvent,
  BlockchainLogDownloadEvent,
} from "../events/blockchain-log.event";

/**
 * Event listener for blockchain logging operations
 * Runs asynchronously in background without blocking main request flow
 */
@Injectable()
export class BlockchainEventListener {
  private readonly logger = new Logger(BlockchainEventListener.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle file share blockchain logging event
   * Runs async, doesn't block the calling code
   */
  @OnEvent("blockchain.log.share", { async: true })
  async handleFileShareLog(event: BlockchainLogShareEvent) {
    try {
      this.logger.log(
        `Processing blockchain log for file share: ${event.fileId}`,
      );

      // Fetch sender's email
      const sender = await this.prisma.user.findUnique({
        where: { id: event.senderId },
        select: { email: true },
      });

      if (!sender?.email) {
        this.logger.error(
          `❌ Cannot log to blockchain: Sender ${event.senderId} has no email`,
        );
        return;
      }

      // Fetch recipients' emails
      const recipients = await this.prisma.user.findMany({
        where: { id: { in: event.recipientIds } },
        select: { id: true, email: true },
      });

      const recipientEmails = recipients.map((r) => r.email);

      if (recipientEmails.length === 0) {
        this.logger.error(`❌ Cannot log to blockchain: No recipients found`);
        return;
      }

      const txHash = await this.blockchainService.logFileShare({
        fileId: event.fileId,
        senderEmail: sender.email,
        recipientEmails,
        timestamp: event.timestamp,
      });

      if (txHash) {
        // Update activity with blockchain tx hash
        await this.prisma.fileActivity.update({
          where: { id: event.activityId },
          data: { blockchainTxHash: txHash },
        });

        this.logger.log(
          `✅ Successfully logged file share to blockchain. TX: ${txHash}`,
        );
      } else {
        this.logger.warn(
          `⚠️ Blockchain logging failed for file share: ${event.fileId}`,
        );
      }
    } catch (error) {
      // Catch errors to prevent crash, but log them
      this.logger.error(
        `❌ Error processing file share blockchain log: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle file download blockchain logging event
   * Runs async, doesn't block the calling code
   */
  @OnEvent("blockchain.log.download", { async: true })
  async handleFileDownloadLog(event: BlockchainLogDownloadEvent) {
    try {
      this.logger.log(
        `Processing blockchain log for file download: ${event.fileId} by ${event.recipientId}`,
      );

      // Fetch user's email
      const user = await this.prisma.user.findUnique({
        where: { id: event.recipientId },
        select: { email: true },
      });

      if (!user?.email) {
        this.logger.error(
          `❌ Cannot log to blockchain: User ${event.recipientId} has no email`,
        );
        return;
      }

      const txHash = await this.blockchainService.logFileDownload({
        fileId: event.fileId,
        recipientEmail: user.email,
        timestamp: event.timestamp,
      });

      if (txHash) {
        // Update activity with blockchain tx hash
        await this.prisma.fileActivity.update({
          where: { id: event.activityId },
          data: { blockchainTxHash: txHash },
        });

        this.logger.log(
          `✅ Successfully logged file download to blockchain. TX: ${txHash}`,
        );
      } else {
        this.logger.warn(
          `⚠️ Blockchain logging failed for file download: ${event.fileId}`,
        );
      }
    } catch (error) {
      // Catch errors to prevent crash, but log them
      this.logger.error(
        `❌ Error processing file download blockchain log: ${error.message}`,
        error.stack,
      );
    }
  }
}
