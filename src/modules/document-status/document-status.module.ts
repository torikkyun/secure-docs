import { Module } from '@nestjs/common';
import { DocumentStatusService } from './document-status.service';
import { DocumentStatusController } from './document-status.controller';
import { DocumentStatus } from './entities/document-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentStatus])],
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
})
export class DocumentStatusModule {}
