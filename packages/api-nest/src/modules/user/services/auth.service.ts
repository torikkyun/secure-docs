import { Role } from "@modules/role/entities/role.entity";
import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { LoginDto } from "../dto/login-user.dto";
import { RegisterDto } from "../dto/register-user.dto";
import { User } from "../entities/user.entity";

const SALT = 12;

@Injectable()
export class AuthService {
  private readonly jwtService: JwtService;
  private readonly userRepository: Repository<User>;
  private readonly roleRepository: Repository<Role>;
  private defaultRole: Role;

  constructor(
    jwtService: JwtService,
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(Role)
    roleRepository: Repository<Role>
  ) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async onModuleInit() {
    const foundRole = await this.roleRepository.findOne({
      where: { name: "user" },
    });
    if (!foundRole) {
      throw new Error(
        "Role 'user' không tồn tại. Vui lòng khởi tạo role trước khi đăng ký người dùng."
      );
    }
    this.defaultRole = foundRole;
  }

  async register({ email, password, ...rest }: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email đã được đăng ký");
    }

    const hashedPassword = await bcrypt.hash(password, SALT);
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.role = this.defaultRole;
    Object.assign(user, rest);

    await this.userRepository.save(user);

    return {
      message: "Đăng ký thành công",
      user: { id: user.id, email: user.email },
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["role"],
    });
    if (!user) {
      throw new ConflictException("Email hoặc mật khẩu không đúng");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException("Email hoặc mật khẩu không đúng");
    }

    const token = this.jwtService.sign({ id: user.id, role: user.role.name });

    return {
      message: "Đăng nhập thành công",
      token,
    };
  }
}
