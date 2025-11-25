import { Module } from "@nestjs/common";
import { AccessGrantController } from "./access-grant.controller";
import { AccessGrantService } from "./access-grant.service";

@Module({
  controllers: [AccessGrantController],
  providers: [AccessGrantService],
  exports: [AccessGrantService],
})
export class AccessGrantModule {}
