import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { FileActivityLoggerABI } from "./abis/FileActivityLogger.abi";

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly config: {
    adminPrivateKey: string;
    rpcUrl: string;
    contractAddress: string;
  };
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  constructor(private readonly configService: ConfigService) {
    const blockchainConfig = configService.get("blockchain");
    this.config = {
      adminPrivateKey: blockchainConfig.adminPrivateKey,
      rpcUrl: blockchainConfig.rpcUrl,
      contractAddress: blockchainConfig.contractAddress,
    };
  }

  async onModuleInit() {
    // Create provider
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    // Create wallet
    this.wallet = new ethers.Wallet(this.config.adminPrivateKey, this.provider);

    // Create contract instance
    this.contract = new ethers.Contract(
      this.config.contractAddress,
      FileActivityLoggerABI,
      this.wallet,
    );
  }

  /**
   * Log file sharing activity on blockchain (Sepolia testnet)
   */
  async logFileShare(data: {
    fileId: string;
    senderEmail: string;
    recipientEmails: string[];
    timestamp: number;
  }): Promise<string | null> {
    if (!this.contract || !this.wallet) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    // Call smart contract method
    const tx = await this.contract.logFileShare(
      data.fileId,
      data.senderEmail,
      data.recipientEmails,
    );

    // Wait for confirmation
    await tx.wait();
    return tx.hash;
  }

  /**
   * Log file download activity on blockchain
   */
  async logFileDownload(data: {
    fileId: string;
    recipientEmail: string;
    timestamp: number;
  }): Promise<string | null> {
    if (!this.contract || !this.wallet) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    // Call smart contract method
    const tx = await this.contract.logFileDownload(
      data.fileId,
      data.recipientEmail,
    );

    // Wait for confirmation
    await tx.wait();
    return tx.hash;
  }

  /**
   * Get admin wallet balance
   */
  async getAdminBalance(): Promise<string> {
    if (!this.provider || !this.wallet) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Query if a recipient has downloaded a file
   */
  async hasRecipientDownloaded(
    fileId: string,
    recipient: string,
  ): Promise<boolean> {
    if (!this.contract) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    return await this.contract.hasRecipientDownloaded(fileId, recipient);
  }

  /**
   * Get all share events for a file
   */
  async getFileShareEvents(fileId: string) {
    if (!this.contract) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }
    const filter = this.contract.filters.FileShared(fileId);
    const events = await this.contract.queryFilter(filter);

    return events
      .filter((event): event is ethers.EventLog => "args" in event)
      .map((event) => ({
        fileId: event.args.fileId,
        sender: event.args.sender,
        recipients: event.args.recipients,
        timestamp: Number(event.args.timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      }));
  }

  /**
   * Get all download events for a file
   */
  async getFileDownloadEvents(fileId: string) {
    if (!this.contract) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    const filter = this.contract.filters.FileDownloaded(fileId);
    const events = await this.contract.queryFilter(filter);

    return events
      .filter((event): event is ethers.EventLog => "args" in event)
      .map((event) => ({
        fileId: event.args.fileId,
        recipient: event.args.recipient,
        timestamp: Number(event.args.timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      }));
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    if (!this.contract) {
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    const [totalShares, totalDownloads] =
      await this.contract.getContractStats();
    return {
      totalShares: Number(totalShares),
      totalDownloads: Number(totalDownloads),
    };
  }
}
