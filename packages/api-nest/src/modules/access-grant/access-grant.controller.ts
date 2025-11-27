import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AccessGrantService } from "./access-grant.service";
import { CreateAccessGrantDto } from "./dto/create-access-grant.dto";
import { QueryAccessGrantDto } from "./dto/query-access-grant.dto";
import { RevokeAccessGrantDto } from "./dto/revoke-access-grant.dto";

@Controller("api/access-grants")
@ApiTags("access-grants")
@ApiBearerAuth()
export class AccessGrantController {
  private readonly accessGrantService: AccessGrantService;

  constructor(accessGrantService: AccessGrantService) {
    this.accessGrantService = accessGrantService;
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAccessGrantDto
  ) {
    const grant = await this.accessGrantService.create(user.id, dto);
    return {
      grantId: grant.id,
      grant,
      message: "Cấp quyền truy cập thành công",
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() dto: QueryAccessGrantDto
  ) {
    return await this.accessGrantService.findAll(user.id, dto);
  }

  @Get(":id")
  async findOne(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return await this.accessGrantService.findOne(user.id, id);
  }

  @Post(":id/revoke")
  async revoke(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() dto: RevokeAccessGrantDto
  ) {
    return await this.accessGrantService.revoke(user.id, id, dto);
  }

  @Get("verify/:id")
  async verify(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return await this.accessGrantService.verify(user.id, id);
  }
}
