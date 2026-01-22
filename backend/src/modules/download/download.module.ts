import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';

@Module({
  imports: [PrismaModule],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
