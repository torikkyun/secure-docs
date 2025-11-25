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
      message: "Access granted successfully",
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryAccessGrantDto
  ) {
    const result = await this.accessGrantService.findAll(user.id, {
      fileId: query.fileId,
      granteeId: query.granteeId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
    return {
      result,
    };
  }

  @Get(":id")
  async findOne(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    const grant = await this.accessGrantService.findOne(user.id, id);
    return {
      grant,
    };
  }

  @Post(":id/revoke")
  async revoke(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() dto: RevokeAccessGrantDto
  ) {
    const result = await this.accessGrantService.revoke(user.id, id, dto);
    return {
      result,
      message: "Access revoked successfully",
    };
  }

  @Get("verify/:id")
  async verify(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    const result = await this.accessGrantService.verify(user.id, id);
    return {
      result,
    };
  }
}
