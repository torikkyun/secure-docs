import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DownloadService } from './download.service';
import { CompleteDownloadDto } from './dto/complete-download.dto';
import { QueryDownloadDto } from './dto/query-download.dto';
import { RequestDownloadDto } from './dto/request-download.dto';

@Controller('api/downloads')
@ApiTags('downloads')
@ApiBearerAuth()
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() dto: QueryDownloadDto,
  ) {
    return await this.downloadService.findAll(user.id, dto);
  }

  @Get(':id')
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return await this.downloadService.findById(user.id, id);
  }

  @Post('request')
  async requestDownload(
    @CurrentUser() user: { id: string },
    @Body() dto: RequestDownloadDto,
    @Req() req: Request,
  ) {
    return await this.downloadService.requestDownload(user.id, dto, req);
  }

  @Get(':id/content')
  async downloadContent(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { filePath, originalFileName, mimeType, fileSize } =
      await this.downloadService.getFileForDownload(user.id, id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${originalFileName}"`,
      'Content-Length': fileSize.toString(),
    });

    res.sendFile(filePath, { root: '.' });
  }

  @Post(':id/complete')
  async completeDownload(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CompleteDownloadDto,
  ) {
    return await this.downloadService.completeDownload(user.id, id, dto);
  }
}
