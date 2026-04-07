import { Controller, Get, Query, Param } from "@nestjs/common";
import { FileActivityService } from "./file-activity.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QueryFileActivityDto } from "./dto/query-file-activity.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";

@Controller("api/file-activity")
@ApiTags("file-activity")
@ApiBearerAuth()
export class FileActivityController {
  constructor(private readonly fileActivityService: FileActivityService) {}

  @Get("user")
  async getUserFileActivities(
    @CurrentUser() user: AuthUser,
    @Query() dto: QueryFileActivityDto,
  ) {
    return this.fileActivityService.getUserFileActivities(user.id, dto);
  }

  @Get("file/:fileId")
  async getFileActivities(
    @Param("fileId") fileId: string,
    @Query() dto: QueryFileActivityDto,
    @CurrentUser() { id }: AuthUser,
  ) {
    return this.fileActivityService.getFileActivities(fileId, dto, id);
  }
}
