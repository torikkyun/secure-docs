import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req);
  }

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('logout')
  @ApiBearerAuth()
  async logout(
    @CurrentUser()
    user: { id: string; role: { name: string }; sessionId: string },
    @Req() req: Request,
  ) {
    const sessionId = user.sessionId;
    if (sessionId) {
      await this.authService.logoutBySessionId(sessionId, req);
      return { message: 'Đăng xuất thành công' };
    }
  }

  // @Post('admin/login')
  // @Public()
  // adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request) {
  //   return this.authService.adminLogin(dto, req);
  // }
}
