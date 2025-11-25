import { Module } from "@nestjs/common";
import { PrismaModule } from "src/database/prisma.module";
import { AccessGrantController } from "./access-grant.controller";
import { AccessGrantService } from "./access-grant.service";

@Module({
  imports: [PrismaModule],
  controllers: [AccessGrantController],
  providers: [AccessGrantService],
  exports: [AccessGrantService],
})
export class AccessGrantModule {}
