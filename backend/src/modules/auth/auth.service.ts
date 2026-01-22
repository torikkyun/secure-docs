import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import extractIpAndUserAgent from 'src/common/utils/request.util';
import { PrismaService } from 'src/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private static readonly EXPIRATION_RE = /^(\d+)(s|m|h|d)?$/;
  private readonly logger = new Logger(AuthService.name);
  private defaultRoleId: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing AuthService...');
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!defaultRole) {
        this.logger.error(
          'Default role user not found in the database. Please run seed script: pnpm run seed:dev',
        );
        throw new Error('Default role user not found in the database');
      }

      this.defaultRoleId = defaultRole.id;
      this.logger.log('AuthService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AuthService', error);
      throw error;
    }
  }

  private parseExpirationToMs(exp: string): number {
    const m = String(exp).trim().toLowerCase().match(AuthService.EXPIRATION_RE);
    if (!m) {
      return 60 * 60 * 1000;
    }
    const value = Number(m[1]);
    const unit = m[2] || 's';
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000;
    }
  }

  private calculateExpiration(exp: string): Date {
    const ms = this.parseExpirationToMs(exp);
    return new Date(Date.now() + ms);
  }

  private async ensureUnique(email: string) {
    const exists = await this.prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });
    if (exists) {
      throw new ConflictException('Email đã được sử dụng');
    }
  }

  async register(
    { username, email, password, passcode, publicKey }: RegisterDto,
    req: Request,
  ) {
    await this.ensureUnique(email);

    const hashedPassword = hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        passcode,
        publicKey,
        roleId: this.defaultRoleId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        publicKey: true,
      },
    });

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    await this.auditService.log({
      userId: user.id,
      eventType: 'USER_REGISTER',
      eventData: {
        username,
        email,
      },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Đăng ký thành công',
      user,
    };
  }

  async login({ email, password }: LoginDto, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const jwtConfig = this.config.get<{ expiration: string }>('jwt')!;
    const expiresIn = jwtConfig.expiration;
    const expiresMs = this.parseExpirationToMs(String(expiresIn));
    const expiresAt = new Date(Date.now() + expiresMs);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tempToken = randomUUID();
    const { ipAddress, userAgent } = extractIpAndUserAgent(req);

    await this.auditService.log({
      userId: user.id,
      eventType: 'USER_LOGIN',
      eventData: {
        email,
        method: 'email_password',
      },
      ipAddress,
      userAgent,
    });

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: tempToken,
        createdAt: new Date(),
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: { name: user.role.name },
      sessionId: session.id,
    });

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { sessionToken: token },
    });

    return {
      success: true,
      message: 'Đăng nhập thành công',
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
      },
    };
  }

  async logoutBySessionId(sessionId: string, req: Request) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    if (session) {
      await this.auditService.log({
        userId: session.userId,
        eventType: 'USER_LOGOUT',
        eventData: {
          method: 'sessionId',
        },
        ipAddress,
        userAgent,
      });
    }

    await this.prisma.userSession.updateMany({
      where: { id: sessionId, isActive: true },
      data: {
        isActive: false,
        lastActivityAt: new Date(),
        expiresAt: new Date(),
      },
    });
  }
}
