import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentStatusController } from "./document-status.controller";
import { DocumentStatusService } from "./document-status.service";
import { DocumentStatus } from "./entities/document-status.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DocumentStatus])],
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
})
export class DocumentStatusModule {}
