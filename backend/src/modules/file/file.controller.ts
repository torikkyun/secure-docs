import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  Res,
  StreamableFile,
  UploadedFiles,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FileService } from "./file.service";
import { UploadFilesDto } from "./dto/create-file.dto";
import * as path from "path";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { QueryFileDto } from "./dto/query-file.dto";

@Controller("api/files")
@ApiTags("files")
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post("upload")
  @UseInterceptors(
    FilesInterceptor("file", 10, {
      storage: diskStorage({
        destination: "./uploads/files",
        filename: (_req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const extension = path.extname(file.originalname);
          callback(null, `${uniqueSuffix}${extension}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB/file
      },
    }),
  )
  uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFilesDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.fileService.createFile(files, dto, user.id);
  }

  @Get()
  getUserFiles(@CurrentUser() user: AuthUser, @Query() dto: QueryFileDto) {
    return this.fileService.getUserFiles(user.id, dto);
  }

  @Get(":fileId")
  getFile(@Param("fileId") fileId: string, @CurrentUser() user: AuthUser) {
    return this.fileService.getFileById(fileId, user.id);
  }

  @Get(":fileId/download")
  getFileForDownload(
    @Param("fileId") fileId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.fileService.getFileForDownload(fileId, user.id);
  }

  @Get(":fileId/stream")
  downloadFile(
    @Param("fileId") fileId: string,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.fileService.downloadFile(fileId, user.id, res);
  }

  @Delete(":fileId")
  deleteFile(@Param("fileId") fileId: string, @CurrentUser() user: AuthUser) {
    return this.fileService.deleteFile(fileId, user.id);
  }
}
