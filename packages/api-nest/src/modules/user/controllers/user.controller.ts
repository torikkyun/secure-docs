import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  // private readonly userService: UserService;
  // constructor(userService: UserService) {
  //   this.userService = userService;
  // }
  // @Get()
  // @Roles("admin")
  // findAll(@Query() query: QueryUserDto) {
  //   return this.userService.findAll(query);
  // }
}
