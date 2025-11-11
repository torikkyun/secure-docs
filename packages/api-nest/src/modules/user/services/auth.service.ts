import { SupabaseService } from "@core/database/supabase.service";
import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { SupabaseClient } from "@supabase/supabase-js";
import { Repository } from "typeorm";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly userStatusRepository: Repository<UserStatus>;
  private readonly supabase: SupabaseClient;
  private readonly jwtService: JwtService;

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserStatus)
    userStatusRepository: Repository<UserStatus>,
    supabaseService: SupabaseService,
    jwtService: JwtService
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.userStatusRepository = userStatusRepository;
    this.supabase = supabaseService.getClient();
    this.jwtService = jwtService;
  }

  async register({ email, password, username }: RegisterUserDto) {
    const { error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error && !error.message.includes("already registered")) {
      throw new ConflictException(error.message);
    }

    let user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new ConflictException("Email đã được đăng ký");
    }

    const role = await this.userRoleRepository.findOne({
      where: { name: "owner" },
    });
    const status = await this.userStatusRepository.findOne({
      where: { name: "active" },
    });

    if (!(role && status)) {
      throw new ConflictException("Role hoặc Status mặc định không tồn tại");
    }

    user = new User();
    user.email = email;
    user.username = username;
    user.role = role;
    user.status = status;
    user.metadata = {};

    await this.userRepository.save(user);

    return {
      message: "Đăng ký thành công",
      user: { id: user.id, email: user.email },
    };
  }

  async login({ email, password }: LoginUserDto) {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["role", "status"],
    });
    if (!user) {
      throw new UnauthorizedException(
        "Tài khoản chưa được đăng ký trong hệ thống"
      );
    }

    const accessToken = this.jwtService.sign({
      id: user.id,
      role: { name: user.role.name },
    });

    return {
      message: "Đăng nhập thành công",
      accessToken,
    };
  }
}
