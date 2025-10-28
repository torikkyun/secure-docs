import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { QueryUserDto } from '../dto/query-user.dto';
import { Roles } from '@common/decorators/roles.decorator';

@Controller('api/users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin')
  @ApiBearerAuth()
  async findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
}
