import { User } from "@modules/user/entities/user.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm/repository/Repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private readonly userRepository: Repository<User>;

  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    userRepository: Repository<User>
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET chưa được cấu hình trong biến môi trường");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    this.userRepository = userRepository;
  }

  async validate({ id }: { id: string }) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }

    return { id: user.id, role: { name: user.role.name } };
  }
}
