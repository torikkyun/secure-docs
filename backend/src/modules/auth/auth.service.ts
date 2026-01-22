import { randomUUID } from "node:crypto";
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ethers } from "ethers";
import { Request } from "express";
import { Role } from "generated/prisma/client";
import { SiweMessage } from "siwe";
import { comparePassword } from "src/common/utils/hash.util";
import extractIpAndUserAgent from "src/common/utils/request.util";
import { PrismaService } from "src/database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { LoginWalletDto } from "./dto/login-wallet.dto";
import { RegisterDto } from "./dto/register.dto";
import { NonceService } from "./nonce.service";

@Injectable()
export class AuthService {
  private readonly prisma: PrismaService;
  private readonly config: ConfigService;
  private readonly nonceService: NonceService;
  private readonly jwtService: JwtService;
  private readonly auditService: AuditService;
  private cachedRole: Role | null = null;
  private static readonly EXPIRATION_RE = /^(\d+)(s|m|h|d)?$/;
  constructor(
    prisma: PrismaService,
    config: ConfigService,
    nonceService: NonceService,
    jwtService: JwtService,
    auditService: AuditService
  ) {
    this.prisma = prisma;
    this.config = config;
    this.nonceService = nonceService;
    this.jwtService = jwtService;
    this.auditService = auditService;
  }

  private async getDefaultRole() {
    if (this.cachedRole) {
      return this.cachedRole;
    }
    const role = await this.prisma.role.findUnique({
      where: { name: "user" },
    });
    if (!role) {
      throw new BadGatewayException("Vai trò mặc định không tồn tại");
    }
    this.cachedRole = role;
    return role;
  }

  async register(
    {
      walletAddress: rawWallet,
      username,
      email,
      signature,
      message,
      publicKey,
    }: RegisterDto,
    req: Request
  ) {
    const walletAddress = this.normalizeWallet(rawWallet);
    await this.verifySiweMessage(message, signature, walletAddress);
    await this.ensureUnique(walletAddress, email);
    const role = await this.getDefaultRole();
    const user = await this.prisma.user.create({
      data: {
        walletAddress,
        username,
        email,
        publicKey,
        roleId: role.id,
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
      },
    });

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    await this.auditService.log({
      userId: user.id,
      eventType: "USER_REGISTER",
      eventData: {
        walletAddress,
        username,
        email,
      },
      signature,
      ipAddress,
      userAgent,
    });
    return {
      success: true,
      message: "Đăng ký thành công",
      user,
    };
  }

  async loginWithWallet(
    { walletAddress: rawWallet, message, signature }: LoginWalletDto,
    req: Request
  ) {
    const walletAddress = this.normalizeWallet(rawWallet);
    await this.verifySiweMessage(message, signature, walletAddress);
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      include: { role: true },
    });
    if (!user) {
      throw new ConflictException("Địa chỉ ví chưa được đăng ký");
    }
    if (!user.isActive) {
      throw new UnauthorizedException(
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
      );
    }
    const jwtConfig = this.config.get("jwt");
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
      eventType: "USER_LOGIN",
      eventData: {
        walletAddress,
        method: "wallet",
      },
      signature,
      ipAddress,
      userAgent,
    });
    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: tempToken,
        walletAddress: user.walletAddress,
        signature,
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
      message: "Đăng nhập thành công",
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
      },
    };
  }

  private parseExpirationToMs(exp: string): number {
    const m = String(exp).trim().toLowerCase().match(AuthService.EXPIRATION_RE);
    if (!m) {
      return 60 * 60 * 1000;
    }
    const value = Number(m[1]);
    const unit = m[2] || "s";
    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000;
    }
  }

  private calculateExpiration(exp: string): Date {
    const ms = this.parseExpirationToMs(exp);
    return new Date(Date.now() + ms);
  }

  private async verifySiweMessage(
    message: string,
    signature: string,
    expectedWalletAddress: string
  ) {
    const siwe = this.parseSiweMessage(message);
    const allowedDomain = this.getAllowedDomain();
    if (siwe.domain !== allowedDomain) {
      throw new BadRequestException("Domain không hợp lệ trong message");
    }

    const entry = await this.nonceService.getNonceFor(expectedWalletAddress);
    if (!entry || entry.nonce !== siwe.nonce) {
      throw new BadRequestException("Nonce không hợp lệ hoặc không tồn tại");
    }

    if (
      siwe.expirationTime &&
      Date.now() > new Date(siwe.expirationTime).getTime()
    ) {
      throw new BadRequestException("SIWE message đã hết hạn");
    }

    await this.performSiweVerification(
      siwe,
      signature,
      allowedDomain,
      entry.nonce
    );

    this.nonceService.markNonceUsed(expectedWalletAddress);
    return true;
  }

  private parseSiweMessage(message: string): SiweMessage {
    try {
      return new SiweMessage(message);
    } catch {
      throw new BadRequestException("Sai định dạng SIWE message");
    }
  }

  private getAllowedDomain(): string {
    const siweConfig = this.config.get("siwe");
    const domainFromConfig = siweConfig.registerDomain as string;
    return domainFromConfig;
  }

  private async performSiweVerification(
    siwe: SiweMessage,
    signature: string,
    allowedDomain: string,
    entryNonce: string
  ) {
    const siweWithVerify = siwe as unknown as {
      verify?: (opts: {
        signature: string;
        domain?: string;
        nonce?: string;
      }) => Promise<{ success: boolean }>;
    };

    if (typeof siweWithVerify.verify === "function") {
      const result = await siweWithVerify.verify({
        signature,
        domain: allowedDomain,
        nonce: entryNonce,
      });
      if (!result || result.success !== true) {
        throw new BadRequestException("Chữ ký SIWE không hợp lệ");
      }
      return;
    }
  }

  private normalizeWallet(rawWallet: string): string {
    try {
      return ethers.getAddress(rawWallet);
    } catch {
      throw new ConflictException("Địa chỉ ví không hợp lệ");
    }
  }

  private async ensureUnique(walletAddress: string, email: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ walletAddress }, { email }],
      },
      select: { walletAddress: true, email: true },
    });
    if (!exists) {
      return;
    }
    if (exists.walletAddress === walletAddress) {
      throw new ConflictException("Địa chỉ ví đã được sử dụng");
    }
    if (exists.email === email) {
      throw new ConflictException("Email đã được sử dụng");
    }
  }

  async logoutBySessionId(sessionId: string, req: Request) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, ipAddress: true, userAgent: true },
    });

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    if (session) {
      await this.auditService.log({
        userId: session.userId,
        eventType: "USER_LOGOUT",
        eventData: {
          method: "sessionId",
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

  async adminLogin({ email, password }: AdminLoginDto, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    if (!user.password) {
      throw new UnauthorizedException(
        "Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu"
      );
    }

    if (user.role.name !== "admin") {
      throw new UnauthorizedException("Chỉ admin mới có thể đăng nhập");
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa");
    }

    const { ipAddress, userAgent } = extractIpAndUserAgent(req);
    const expiresIn = this.config.get("jwt.expiresIn") ?? "24h";
    const expiresAt = this.calculateExpiration(expiresIn);
    const sessionId = randomUUID();

    const session = await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        sessionToken: "",
        walletAddress: user.walletAddress,
        signature: "",
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role.name,
      sessionId: session.id,
    });

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { sessionToken: token },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.log({
      userId: user.id,
      eventType: "USER_LOGIN",
      eventData: { method: "admin_password" },
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role.name,
      },
      token,
      expiresIn,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
