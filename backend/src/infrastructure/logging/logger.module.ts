import { Global, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { BlockchainModule } from "../blockchain/blockchain.module";

@Global()
@Module({
  imports: [BlockchainModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
