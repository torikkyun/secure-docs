import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { UserService } from "./user.service";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get("/profile")
  async getProfile(@CurrentUser() user: { id: string }) {
    return await this.userService.getProfile(user.id);
  }

  @Patch("/profile")
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserProfileDto,
    @Req() req: Request
  ) {
    return await this.userService.updateProfile(user.id, dto, req);
  }

  @Get("/storage")
  async getStorage(@CurrentUser() user: { id: string }) {
    return await this.userService.getStorageInfo(user.id);
  }

  @Get()
  @Roles("admin")
  async findAll(@Query() dto: QueryUserDto) {
    return await this.userService.findAll(dto);
  }

  @Get("wallet/:address")
  async getUserByWallet(@Param("address") address: string) {
    return await this.userService.findByWallet(address);
  }

  @Get("email/:email")
  async getUserByEmail(@Param("email") email: string) {
    return await this.userService.findByEmail(email);
  }
}
