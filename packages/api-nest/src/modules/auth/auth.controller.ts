import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginWalletDto } from "./dto/login-wallet.dto";
import { NonceService } from "./nonce.service";

@Controller("api/auth")
@Public()
@ApiTags("auth")
export class AuthController {
  private readonly authService: AuthService;
  private readonly nonceService: NonceService;
  constructor(authService: AuthService, nonceService: NonceService) {
    this.authService = authService;
    this.nonceService = nonceService;
  }

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginWalletDto) {
    return this.authService.loginWithWallet(dto);
  }

  @Get("nonce/:wallet")
  async getNonce(@Param("wallet") wallet: string) {
    const { nonce, expiresAt } = await this.nonceService.createNonceFor(wallet);
    return {
      nonce,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }
}
