import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import extractIpAndUserAgent from 'src/common/utils/request.util';
import { PrepareUploadDto } from './dto/prepare-upload.dto';
import { QueryFileDto } from './dto/query-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileService } from './file.service';

@Controller('api/files')
@ApiTags('files')
@ApiBearerAuth()
export class FileController {
  constructor(private readonly filesService: FileService) {}

  @Post('prepare-upload')
  async prepareUpload(
    @CurrentUser() user: { id: string },
    @Body() dto: PrepareUploadDto,
  ) {
    return await this.filesService.prepareUpload(user.id, dto.fileSize);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = './uploads';
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  async uploadFile(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    return await this.filesService.handleFileUpload(
      user.id,
      file,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string; role: { name: string } },
    @Query() dto: QueryFileDto,
  ) {
    return this.filesService.findAll(user.id, user.role.name, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.filesService.findOne(user.id, id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    return this.filesService.remove(user.id, id, ipAddress, userAgent);
  }
}
