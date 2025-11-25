import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { PrepareUploadDto } from "./dto/prepare-upload.dto";
import { QueryFileDto } from "./dto/query-file.dto";
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileService } from "./file.service";

@Controller("api/files")
@ApiTags("files")
@ApiBearerAuth()
export class FileController {
  private readonly filesService: FileService;
  constructor(filesService: FileService) {
    this.filesService = filesService;
  }

  @Post("prepare-upload")
  async prepareUpload(
    @CurrentUser() user: { id: string },
    @Body() dto: PrepareUploadDto
  ) {
    return await this.filesService.prepareUpload(user.id, dto.fileSize);
  }

  @Post("upload")
  async uploadFile(
    @CurrentUser() user: { id: string },
    @Body() dto: UploadFileDto
  ) {
    return await this.filesService.createFile(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query() dto: QueryFileDto) {
    return this.filesService.findAll(user.id, dto);
  }

  @Get(":id")
  findOne(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.filesService.findOne(user.id, id);
  }

  @Delete(":id")
  remove(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.filesService.remove(user.id, id);
  }
}
