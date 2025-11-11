import { Public } from "@common/decorators/public.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { AuthService } from "../services/auth.service";

@Controller("api/auth")
@Public()
@ApiTags("auth")
export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post("register")
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }
}
