import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileActivityService } from "./file-activity.service";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards/jwt.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import {
  QueryFileActivityDto,
  PaginatedFileActivitiesDto,
} from "./dto/file-activity.dto";

@Controller("api/file-activity")
@ApiTags("file-activity")
@ApiBearerAuth()
export class FileActivityController {
  constructor(private readonly fileActivityService: FileActivityService) {}

  @Get("user")
  async getUserFileActivities(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryFileActivityDto,
  ) {
    return this.fileActivityService.getUserFileActivities(user.id, {
      page: query.page,
      limit: query.limit,
    });
  }

  @Get("file/:fileId")
  async getFileActivities(
    @Param("fileId") fileId: string,
    @Query() query: QueryFileActivityDto,
    @CurrentUser() user: AuthUser,
  ) {
    const hasAccess = await this.verifyFileAccess(fileId, user.id);
    if (!hasAccess) {
      throw new BadRequestException(
        "Bạn không có quyền xem hoạt động của file này",
      );
    }

    return this.fileActivityService.getFileActivities(fileId, {
      page: query.page,
      limit: query.limit,
    });
  }

  private async verifyFileAccess(
    fileId: string,
    userId: string,
  ): Promise<boolean> {
    const file = await this.fileActivityService["prisma"].file.findFirst({
      where: {
        id: fileId,
        OR: [
          { ownerId: userId },
          { shares: { some: { recipientId: userId } } },
        ],
      },
    });

    return !!file;
  }
}
