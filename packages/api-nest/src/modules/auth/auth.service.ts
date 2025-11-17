import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { comparePassword, hashPassword } from "src/common/utils/hash.util";
import { PrismaService } from "src/database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly jwtService: JwtService;
  private readonly prisma: PrismaService;
  constructor(jwtService: JwtService, prisma: PrismaService) {
    this.jwtService = jwtService;
    this.prisma = prisma;
  }

  async register({ email, password, ...rest }: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email đã được đăng ký");
    }

    const role = await this.prisma.role.findUnique({ where: { name: "user" } });
    if (!role) {
      throw new ConflictException("Vai trò mặc định không tồn tại");
    }

    const hashedPassword = hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: role.id,
        ...rest,
      },
    });

    return {
      message: "Đăng ký thành công",
      user: { id: user.id, email: user.email },
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      throw new ConflictException("Email hoặc mật khẩu không đúng");
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException("Email hoặc mật khẩu không đúng");
    }

    const token = this.jwtService.sign({
      id: user.id,
      role: { name: user.role.name },
    });

    return {
      message: "Đăng nhập thành công",
      token,
    };
  }
}
