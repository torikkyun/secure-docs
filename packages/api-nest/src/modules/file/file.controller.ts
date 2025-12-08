import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import extractIpAndUserAgent from "src/common/utils/request.util";
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
    @Body() dto: UploadFileDto,
    @Req() req: Request
  ) {
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    return await this.filesService.createFile(
      user.id,
      dto,
      ipAddress,
      userAgent
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string; role: { name: string } },
    @Query() dto: QueryFileDto
  ) {
    return this.filesService.findAll(user.id, user.role.name, dto);
  }

  @Get(":id")
  findOne(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.filesService.findOne(user.id, id);
  }

  @Delete(":id")
  remove(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Req() req: Request
  ) {
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    return this.filesService.remove(user.id, id, ipAddress, userAgent);
  }
}
