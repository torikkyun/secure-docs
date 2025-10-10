import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Request } from 'express';
import { UserResponse } from './types/user-reponse.type';

@Controller('api/users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(
    @CurrentUser() { id }: { id: string },
  ): Promise<{ message: string; user: UserResponse }> {
    return this.usersService.getUser(id);
  }

  @Get(':userId')
  @Roles('admin')
  getUser(
    @CurrentUser() { id }: { id: string },
    @Param('userId') userId: string,
  ): Promise<{ message: string; user: UserResponse }> {
    return this.usersService.getUser(id, userId);
  }

  @Post()
  @Roles('admin')
  create(
    @CurrentUser() { id }: { id: string },
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: UserResponse }> {
    return this.usersService.create(id, req, createUserDto);
  }

  @Patch(':userId')
  @Roles('admin')
  update(
    @CurrentUser() { id }: { id: string },
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') userId: string,
  ): Promise<{ message: string; user: UserResponse }> {
    return this.usersService.update(id, userId, updateUserDto);
  }
}
