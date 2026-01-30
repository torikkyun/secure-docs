import { Controller, Post, Get, Delete, Param, Body } from "@nestjs/common";
import { ShareService } from "./share.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/common/types/auth-user.type";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@Controller("api/shares")
@ApiTags("shares")
@ApiBearerAuth()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  async createShare(
    @Body() dto: CreateShareDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shareService.createShare(dto, user.id);
  }

  // @Get("received")
  // async getReceivedShares(@CurrentUser() user: AuthUser) {
  //   return this.shareService.getReceivedShares(user.id);
  // }

  // @Get("sent")
  // async getSentShares(@CurrentUser() user: AuthUser) {
  //   return this.shareService.getSentShares(user.id);
  // }

  // @Get(":shareId")
  // async getShare(
  //   @Param("shareId") shareId: string,
  //   @CurrentUser() user: AuthUser,
  // ) {
  //   return this.shareService.getShareById(shareId, user.id);
  // }

  // @Delete(":shareId")
  // async revokeShare(
  //   @Param("shareId") shareId: string,
  //   @CurrentUser() user: AuthUser,
  // ) {
  //   await this.shareService.revokeShare(shareId, user.id);
  //   return { message: "Share revoked successfully" };
  // }
}
