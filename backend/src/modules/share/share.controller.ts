import { Controller, Post, Body, Req } from "@nestjs/common";
import { ShareService } from "./share.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/common/types/auth-user.type";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
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
}
