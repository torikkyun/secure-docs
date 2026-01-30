import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { FileActivityLoggerABI } from "./abi/FileActivityLogger.abi";

interface BlockchainConfig {
  adminPrivateKey: string;
  rpcUrl: string;
  contractAddress: string;
}

interface ShareLogData {
  fileId: string;
  senderEmail: string; // Email of sender
  recipientEmails: string[]; // Emails of recipients
  timestamp: number;
}

interface DownloadLogData {
  fileId: string;
  recipientEmail: string; // Email of recipient
  timestamp: number;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly config: BlockchainConfig;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      adminPrivateKey: this.configService.get<string>(
        "BLOCKCHAIN_ADMIN_PRIVATE_KEY",
        "",
      ),
      rpcUrl: this.configService.get<string>(
        "BLOCKCHAIN_RPC_URL",
        "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      ),
      contractAddress: this.configService.get<string>(
        "BLOCKCHAIN_CONTRACT_ADDRESS",
        "",
      ),
    };
  }

  async onModuleInit() {
    if (this.isEnabled()) {
      await this.initializeBlockchain();
    } else {
      this.logger.warn(
        "⚠️ Blockchain service is disabled. Missing configuration.",
      );
    }
  }

  private async initializeBlockchain() {
    try {
      this.logger.log("🔗 Initializing blockchain connection...");

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
        `✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`,
      );
      this.logger.log(`📍 Contract address: ${this.config.contractAddress}`);
      this.logger.log(`💰 Admin wallet: ${this.wallet.address}`);
      this.logger.log(`💵 Balance: ${ethers.formatEther(balance)} ETH`);

      // Verify contract ownership
      const owner = await this.contract.owner();
      if (owner.toLowerCase() === this.wallet.address.toLowerCase()) {
        this.logger.log(`✅ Admin wallet is contract owner`);
      } else {
        this.logger.warn(
          `⚠️ Admin wallet (${this.wallet.address}) is NOT the contract owner (${owner})`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to initialize blockchain: ${error.message}`,
        error.stack,
      );
      // Don't throw - allow app to start without blockchain
      this.provider = null;
      this.wallet = null;
      this.contract = null;
    }
  }

  /**
   * Log file sharing activity on blockchain (Sepolia testnet)
   */
  async logFileShare(data: ShareLogData): Promise<string | null> {
    if (!this.contract || !this.wallet) {
      this.logger.warn("Blockchain not initialized, skipping share log");
      return null;
    }

    try {
      this.logger.log(
        `📤 Logging share to blockchain: File ${data.fileId} shared by ${data.senderEmail} with ${data.recipientEmails.length} recipients`,
      );

      // Call smart contract method
      const tx = await this.contract.logFileShare(
        data.fileId,
        data.senderEmail,
        data.recipientEmails,
      );

      this.logger.log(`⏳ Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      this.logger.log(
        `✅ Share logged on blockchain! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed.toString()}`,
      );

      return tx.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to log share to blockchain: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Log file download activity on blockchain
   */
  async logFileDownload(data: DownloadLogData): Promise<string | null> {
    if (!this.contract || !this.wallet) {
      this.logger.warn("Blockchain not initialized, skipping download log");
      return null;
    }

    try {
      this.logger.log(
        `📥 Logging download to blockchain: File ${data.fileId} downloaded by ${data.recipientEmail}`,
      );

      // Call smart contract method
      const tx = await this.contract.logFileDownload(
        data.fileId,
        data.recipientEmail,
      );

      this.logger.log(`⏳ Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      this.logger.log(
        `✅ Download logged on blockchain! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed.toString()}`,
      );

      return tx.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to log download to blockchain: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Check if blockchain logging is enabled
   */
  isEnabled(): boolean {
    return !!(
      this.config.adminPrivateKey &&
      this.config.rpcUrl &&
      this.config.contractAddress
    );
  }

  /**
   * Get admin wallet balance
   */
  async getAdminBalance(): Promise<string> {
    if (!this.provider || !this.wallet) {
      return "0";
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      return "0";
    }
  }

  /**
   * Query if a recipient has downloaded a file
   */
  async hasRecipientDownloaded(
    fileId: string,
    recipient: string,
  ): Promise<boolean> {
    if (!this.contract) {
      return false;
    }

    try {
      return await this.contract.hasRecipientDownloaded(fileId, recipient);
    } catch (error) {
      this.logger.error(`Failed to query download status: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all share events for a file
   */
  async getFileShareEvents(fileId: string) {
    if (!this.contract) {
      return [];
    }

    try {
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
    } catch (error) {
      this.logger.error(`Failed to query share events: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all download events for a file
   */
  async getFileDownloadEvents(fileId: string) {
    if (!this.contract) {
      return [];
    }

    try {
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
    } catch (error) {
      this.logger.error(`Failed to query download events: ${error.message}`);
      return [];
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    if (!this.contract) {
      return { totalShares: 0, totalDownloads: 0 };
    }

    try {
      const [totalShares, totalDownloads] =
        await this.contract.getContractStats();
      return {
        totalShares: Number(totalShares),
        totalDownloads: Number(totalDownloads),
      };
    } catch (error) {
      this.logger.error(`Failed to get contract stats: ${error.message}`);
      return { totalShares: 0, totalDownloads: 0 };
    }
  }
}
