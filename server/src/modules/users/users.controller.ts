import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUserDto } from './dto/search-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';
import { Prisma } from 'generated/prisma';
import { Public } from '@common/decorators/public.decorator';

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

  @Post()
  @Public()
  async createOrFindUser(
    @Body()
    body: {
      email: string;
      name?: string;
      googleId?: string;
      avatarUrl?: string;
    },
  ) {
    return this.usersService.createOrFindUser(body);
  }
}
