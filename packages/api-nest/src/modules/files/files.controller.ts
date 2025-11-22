import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { PrepareUploadDto } from "./dto/prepare-upload.dto";
import { UploadFileDto } from "./dto/upload-file.dto";
import { FilesService } from "./files.service";

@Controller("api/files")
@ApiTags("files")
@ApiBearerAuth()
export class FilesController {
  private readonly filesService: FilesService;
  constructor(filesService: FilesService) {
    this.filesService = filesService;
  }

  @Post("prepare-upload")
  async prepareUpload(
    @CurrentUser() user: { id: string },
    @Body() dto: PrepareUploadDto
  ) {
    const result = await this.filesService.prepareUpload(user.id, dto.fileSize);
    return {
      uploadId: result.uploadId,
      canUpload: result.canUpload,
      remainingStorage: result.remainingStorage,
      metadata: {
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        fileType: dto.fileType,
      },
    };
  }

  @Post("upload")
  async uploadFile(
    @CurrentUser() user: { id: string },
    @Body() dto: UploadFileDto
  ) {
    const file = await this.filesService.createFile(user.id, dto);

    return {
      fileId: (file as { id: string }).id,
      file,
      message: "Upload thành công",
    };
  }
}
