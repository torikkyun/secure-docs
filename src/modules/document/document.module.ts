import { StorageModule } from "@core/storage/storage.module";
import { DocumentStatus } from "@modules/document-status/entities/document-status.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { Document } from "./entities/document.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentStatus]),
    StorageModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
