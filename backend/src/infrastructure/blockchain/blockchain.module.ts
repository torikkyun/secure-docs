import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BlockchainService } from "./blockchain.service";
import { BlockchainEventListener } from "./listeners/blockchain-event.listener";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BlockchainService, BlockchainEventListener],
  exports: [BlockchainService],
})
export class BlockchainModule {}
