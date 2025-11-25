import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginWalletDto } from "./dto/login-wallet.dto";
import { RegisterDto } from "./dto/register.dto";
import { NonceService } from "./nonce.service";

@Controller("api/auth")
@ApiTags("auth")
export class AuthController {
  private readonly authService: AuthService;
  private readonly nonceService: NonceService;
  constructor(authService: AuthService, nonceService: NonceService) {
    this.authService = authService;
    this.nonceService = nonceService;
  }

  @Post("register")
  @Public()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Public()
  login(@Body() dto: LoginWalletDto, @Req() req: Request) {
    return this.authService.loginWithWallet(dto, req);
  }

  @Get("nonce/:wallet")
  @Public()
  async getNonce(@Param("wallet") wallet: string) {
    const { nonce, expiresAt } = await this.nonceService.createNonceFor(wallet);
    return {
      nonce,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  @Post("logout")
  @ApiBearerAuth()
  async logout(
    @CurrentUser()
    user: { id: string; role: { name: string }; sessionId: string }
  ) {
    const sessionId = user.sessionId;
    if (sessionId) {
      await this.authService.logoutBySessionId(sessionId);
      return { message: "Đăng xuất thành công" };
    }
  }
}
