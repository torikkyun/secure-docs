import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { IdParamDto } from '@common/dto/id-param.dto';
import { QueryDocumentDto } from './dto/query-document.dto';

@Controller('api/documents')
@ApiTags('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @CurrentUser() user: User,
  ) {
    return this.documentService.uploadDocument(file, uploadDto, user);
  }

  @Get()
  @ApiBearerAuth()
  async findAll(@CurrentUser() user: User, @Query() query: QueryDocumentDto) {
    return this.documentService.findAll(user, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param() { id }: IdParamDto) {
    return this.documentService.findOne(id);
  }
}
