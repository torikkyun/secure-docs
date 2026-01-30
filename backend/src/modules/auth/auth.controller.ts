import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthUser } from "src/common/types/auth-user.type";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { VerifyPasscodeDto } from "./dto/verify-passcode.dto";

@Controller("api/auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Public()
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("verify-passcode")
  async verifyPasscode(
    @Body() dto: VerifyPasscodeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.authService.verifyPasscode(dto, user.id);
  }
}
