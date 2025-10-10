import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { PrismaService } from '@core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthenticationService } from '@core/authentication/authentication.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authentication: AuthenticationService,
  ) {}

  async login({ staffId, password }: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { staffId },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new BadRequestException('Sai mã nhân viên hoặc mật khẩu');
    }

    const accessToken = await this.authentication.generateAccessToken(user);
    const refreshToken = await this.authentication.generateRefreshToken(user);

    return {
      message: 'Đăng nhập thành công',
      accessToken,
      refreshToken,
    };
  }
}
