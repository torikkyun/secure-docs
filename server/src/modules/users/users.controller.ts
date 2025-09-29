import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUserDto } from './dto/search-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { Prisma } from 'generated/prisma';
import { Public } from '@common/decorators/public.decorator';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  async findAll(
    @Query() searchUserDto: SearchUserDto,
  ): Promise<PaginatedResponseDto<Prisma.UserGetPayload<object>>> {
    return this.usersService.findAll(searchUserDto);
  }

  @Post('login')
  @Public()
  async login(
    @Body()
    loginUserDto: LoginUserDto,
  ) {
    return this.usersService.login(loginUserDto);
  }
}
