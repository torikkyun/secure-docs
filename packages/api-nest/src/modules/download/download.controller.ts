import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { DownloadService } from "./download.service";
import { CompleteDownloadDto } from "./dto/complete-download.dto";
import { RequestDownloadDto } from "./dto/request-download.dto";

@Controller("api/downloads")
@ApiTags("downloads")
@ApiBearerAuth()
export class DownloadController {
  private readonly downloadService: DownloadService;
  constructor(downloadService: DownloadService) {
    this.downloadService = downloadService;
  }

  @Post("request")
  async requestDownload(
    @CurrentUser() user: { id: string },
    @Body() dto: RequestDownloadDto,
    @Req() req: Request
  ) {
    return await this.downloadService.requestDownload(user.id, dto, req);
  }

  @Post(":id/complete")
  async completeDownload(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() dto: CompleteDownloadDto
  ) {
    return await this.downloadService.completeDownload(user.id, id, dto);
  }
}
