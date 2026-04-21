import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyPasscodeDto } from "./dto/verify-passcode.dto";
import { PrismaService } from "@/database/prisma.service";
import { comparePassword, hashPassword } from "@/common/utils/hash.util";
import { extractIpAndUserAgent } from "@/common/utils/request.util";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private defaultRoleId: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private generateAccessToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }

  async onModuleInit() {
    try {
      this.logger.log("Initializing AuthService...");
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: "user" },
      });

      if (!defaultRole) {
        this.logger.error(
          "Default role user not found in the database. Please run seed script: pnpm run seed:dev",
        );
        throw new Error("Default role user not found in the database");
      }

      this.defaultRoleId = defaultRole.id;
      this.logger.log("AuthService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize AuthService", error);
      throw error;
    }
  }

  async register({ email, password, passcode, ...rest }: RegisterDto) {
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
    const hashedPasscode = hashPassword(passcode);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        passcode: hashedPasscode,
        roleId: role.id,
        avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(email)}&background=%23ffffff`,
        ...rest,
      },
    });

    const accessToken = this.generateAccessToken(user.id);

    return {
      message: "Đăng ký thành công",
      accessToken,
    };
  }

  async login({ email, password }: LoginDto, req: Request) {
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

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);

    // Detect suspicious login: new IP or new device for this user
    const [knownIp, knownDevice] = await Promise.all([
      this.prisma.loginActivity.findFirst({
        where: { userId: user.id, ipAddress },
      }),
      this.prisma.loginActivity.findFirst({
        where: { userId: user.id, userAgent },
      }),
    ]);
    const isSuspicious = !knownIp || !knownDevice;

    this.prisma.loginActivity
      .create({
        data: { userId: user.id, ipAddress, userAgent, isSuspicious },
      })
      .catch((err) =>
        this.logger.error("Failed to record login activity", err),
      );

    const accessToken = this.generateAccessToken(user.id);

    return {
      message: "Đăng nhập thành công",
      accessToken,
    };
  }

  async verifyPasscode({ passcode }: VerifyPasscodeDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passcode: true },
    });

    if (!user || !user.passcode) {
      return false;
    }

    return comparePassword(passcode, user.passcode);
  }
}
