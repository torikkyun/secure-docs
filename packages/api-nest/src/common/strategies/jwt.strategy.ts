import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/database/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private readonly prisma: PrismaService;
  constructor(configService: ConfigService, prisma: PrismaService) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET chưa được cấu hình trong biến môi trường");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    this.prisma = prisma;
  }

  async validate({ id, sessionId }: { id: string; sessionId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
      );
    }

    if (!sessionId) {
      throw new UnauthorizedException(
        "Session không được tìm thấy trong token"
      );
    }

    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException("Phiên làm việc không tồn tại");
    }

    if (!session.isActive) {
      throw new UnauthorizedException("Phiên làm việc đã bị thu hồi");
    }

    return { id: user.id, role: { name: user.role.name }, sessionId };
  }
}
