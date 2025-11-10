import { Roles } from "@common/decorators/roles.decorator";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QueryUserDto } from "../dto/query-user.dto";
import { UserService } from "../services/user.service";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  @Roles("admin")
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
}
