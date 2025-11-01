import { CurrentUser } from "@common/decorators/current-user.decorator";
import { IdParamDto } from "@common/dto/id-param.dto";
import { User } from "@modules/user/entities/user.entity";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { DocumentService } from "./document.service";
import { QueryDocumentDto } from "./dto/query-document.dto";
import { UploadDocumentDto } from "./dto/upload-document.dto";
import { UpdateStatusDocumentDto } from "./dto/update-status-document.dto";

const MAX_FILE_SIZE_MB = 100;
const BYTES_IN_KB = 1024;
const BYTES_IN_MB = BYTES_IN_KB * BYTES_IN_KB;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * BYTES_IN_MB;

@Controller("api/documents")
@ApiTags("documents")
export class DocumentController {
  private readonly documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @CurrentUser() user: User
  ) {
    return this.documentService.uploadDocument(file, uploadDto, user);
  }

  @Get()
  @ApiBearerAuth()
  findAll(@CurrentUser() user: User, @Query() query: QueryDocumentDto) {
    return this.documentService.findAll(user, query);
  }

  @Get(":id")
  @ApiBearerAuth()
  findOne(@Param() { id }: IdParamDto) {
    return this.documentService.findOne(id);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  updateStatus(
    @Param() { id }: IdParamDto,
    @Body() updateStatusDto: UpdateStatusDocumentDto
  ) {
    return this.documentService.updateStatus(id, updateStatusDto);
  }
}
