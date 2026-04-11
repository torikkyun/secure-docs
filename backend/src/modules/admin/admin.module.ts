import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AnomalyDetectionService } from "./anomaly-detection.service";
import { PrismaModule } from "@/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AnomalyDetectionService],
  exports: [AdminService],
})
export class AdminModule {}
