import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Document } from './entities/document.entity';
import { DocumentStatus } from '@modules/document-status/entities/document-status.entity';
import { StorageModule } from '@core/storage/storage.module';

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
