import { Controller, Post, Body, Req, Delete, Param } from "@nestjs/common";
import { ShareService } from "./share.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { CreateGroupShareDto } from "./dto/create-group-share.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "@/common/types/auth-user.type";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Request } from "express";

@Controller("api/shares")
@ApiTags("shares")
@ApiBearerAuth()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  async createShare(
    @Body() dto: CreateShareDto,
    @CurrentUser() { id }: AuthUser,
    @Req() req: Request,
  ) {
    return this.shareService.createShare(dto, id, req);
  }

  @Post("group")
  async createGroupShare(
    @Body() dto: CreateGroupShareDto,
    @CurrentUser() { id }: AuthUser,
    @Req() req: Request,
  ) {
    return this.shareService.createGroupShare(dto, id, req);
  }

  @Delete(":fileId/revoke/:recipientId")
  revokeShare(
    @Param("fileId") fileId: string,
    @Param("recipientId") recipientId: string,
    @CurrentUser() { id }: AuthUser,
    @Req() req: Request,
  ) {
    return this.shareService.revokeShare(fileId, recipientId, id, req);
  }
}
