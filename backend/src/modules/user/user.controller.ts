import { Controller, Get, Param, Query, Patch, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserService } from "./user.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  getProfile(@CurrentUser() { id }: AuthUser) {
    return this.userService.getProfile(id);
  }

  @Patch("profile")
  updateProfile(
    @CurrentUser() { id }: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(id, dto);
  }

  @Get()
  findAll(@Query() dto: QueryUserDto) {
    return this.userService.findAll(dto);
  }

  @Get(":userId")
  findById(@Param("userId") userId: string) {
    return this.userService.findById(userId);
  }
}
