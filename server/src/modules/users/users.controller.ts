import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUserDto } from './dto/search-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { Prisma, User } from 'generated/prisma/wasm';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from '@common/decorators/public.decorator';

@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Public()
  register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<{ message: string; email: string }> {
    return this.usersService.register(registerUserDto);
  }

  @Post('login')
  @Public()
  login(@Body() loginUserDto: LoginUserDto): Promise<{
    message: string;
    user: Omit<User, 'password'>;
    accessToken: string;
  }> {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  @ApiBearerAuth()
  async findAll(
    @Query() searchUserDto: SearchUserDto,
  ): Promise<
    PaginatedResponseDto<Omit<Prisma.UserGetPayload<object>, 'password'>>
  > {
    return this.usersService.findAll(searchUserDto);
  }
}
