import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUserDto } from './dto/search-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { Prisma } from 'generated/prisma';
import { Public } from '@common/decorators/public.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './types/user-response.type';

@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  async findAll(
    @Query() searchUserDto: SearchUserDto,
  ): Promise<PaginatedResponseDto<UserResponse>> {
    return this.usersService.findAll(searchUserDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  async findById(@Query('id') id: string): Promise<{
    message: string;
    user: UserResponse;
  }> {
    return this.usersService.findById(id);
  }

  @Post('login')
  @Public()
  async login(
    @Body()
    loginUserDto: LoginUserDto,
  ): Promise<{
    message: string;
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
  }> {
    return this.usersService.login(loginUserDto);
  }
}
