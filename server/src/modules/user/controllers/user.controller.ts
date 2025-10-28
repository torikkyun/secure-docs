import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { QueryUserDto } from '../dto/query-user.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('api/users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@CurrentUser() user: { id: string; _role: string }) {
    return this.userService.profile(user);
  }

  @Get(':userId')
  @ApiBearerAuth()
  async getUserById(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth()
  async findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
}
