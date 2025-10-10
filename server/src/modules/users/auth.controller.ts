import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthService } from './auth.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('api/auth')
@ApiTags('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
