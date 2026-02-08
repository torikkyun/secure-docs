import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { FileActivityLoggerABI } from "./abi/FileActivityLogger.abi";

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
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
    try {
      this.logger.log("Initializing blockchain connection...");

      // Create provider
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

      // Create wallet
      this.wallet = new ethers.Wallet(
        this.config.adminPrivateKey,
        this.provider,
      );

      // Create contract instance
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        FileActivityLoggerABI,
        this.wallet,
      );

      // Verify connection
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);

      this.logger.log(
        `Connected to network: ${network.name} (Chain ID: ${network.chainId})`,
      );
      this.logger.log(`Contract address: ${this.config.contractAddress}`);
      this.logger.log(`Admin wallet: ${this.wallet.address}`);
      this.logger.log(`Balance: ${ethers.formatEther(balance)} ETH`);

      // Verify contract ownership
      const owner = await this.contract.owner();
      if (owner.toLowerCase() === this.wallet.address.toLowerCase()) {
        this.logger.log(`Admin wallet is contract owner`);
      } else {
        this.logger.warn(
          `Admin wallet (${this.wallet.address}) is NOT the contract owner (${owner})`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize blockchain: ${error.message}`,
        error.stack,
      );
    }
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
      this.logger.error("Blockchain not initialized");
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    this.logger.log(
      `Logging share to blockchain: File ${data.fileId} shared by ${data.senderEmail} with ${data.recipientEmails.length} recipients`,
    );

    // Call smart contract method
    const tx = await this.contract.logFileShare(
      data.fileId,
      data.senderEmail,
      data.recipientEmails,
    );

    this.logger.log(`Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    this.logger.log(
      `Share logged on blockchain! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed.toString()}`,
    );

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
      this.logger.error("Blockchain not initialized");
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    this.logger.log(
      `Logging download to blockchain: File ${data.fileId} downloaded by ${data.recipientEmail}`,
    );

    // Call smart contract method
    const tx = await this.contract.logFileDownload(
      data.fileId,
      data.recipientEmail,
    );

    this.logger.log(`Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    this.logger.log(
      `Download logged on blockchain! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed.toString()}`,
    );

    return tx.hash;
  }

  /**
   * Get admin wallet balance
   */
  async getAdminBalance(): Promise<string> {
    if (!this.provider || !this.wallet) {
      this.logger.error("Blockchain not initialized");
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
      this.logger.error("Contract not initialized");
      throw new InternalServerErrorException("Blockchain not initialized");
    }

    return await this.contract.hasRecipientDownloaded(fileId, recipient);
  }

  /**
   * Get all share events for a file
   */
  async getFileShareEvents(fileId: string) {
    if (!this.contract) {
      this.logger.error("Contract not initialized");
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
      this.logger.error("Contract not initialized");
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
      this.logger.error("Contract not initialized");
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
