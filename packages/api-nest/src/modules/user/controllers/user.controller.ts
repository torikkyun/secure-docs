import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
import { UserService } from "../services/user.service";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  // @Get()
  // @Roles("admin")
  // findAll(@Query() query: QueryUserDto) {
  //   return this.userService.findAll(query);
  // }

  @Get("me")
  getMe(@CurrentUser() user: User) {
    return this.userService.getMe(user.id);
  }
}
