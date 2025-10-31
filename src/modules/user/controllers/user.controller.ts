import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { IdParamDto } from "@common/dto/id-param.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QueryUserDto } from "../dto/query-user.dto";
import { User } from "../entities/user.entity";
import { UserService } from "../services/user.service";

@Controller("api/users")
@ApiTags("users")
export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get("profile")
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: User) {
    return this.userService.profile(user);
  }

  @Get(":id")
  @ApiBearerAuth()
  getUserById(@Param() { id }: IdParamDto) {
    return this.userService.getUserById(id);
  }

  @Get()
  @Roles("admin", "staff")
  @ApiBearerAuth()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
}
