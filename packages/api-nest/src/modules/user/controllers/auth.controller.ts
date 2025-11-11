import { Public } from "@common/decorators/public.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoginGoogleUserDto } from "../dto/login-google-user.dto";
import { AuthService } from "../services/auth.service";

@Controller("api/auth")
@Public()
@ApiTags("auth")
export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post("login-google")
  loginGoogle(@Body() body: LoginGoogleUserDto) {
    return this.authService.loginGoogle(body);
  }
}
