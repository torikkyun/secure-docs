import { JwtStrategy } from "@common/strategies/jwt.strategy";
import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./controllers/user.controller";
import { User } from "./entities/user.entity";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: config.get("JWT_EXPIRATION"),
        },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    TypeOrmModule.forFeature([User, UserRole, UserStatus]),
  ],
  controllers: [UserController],
  providers: [JwtModule, JwtStrategy, UserService],
})
export class UserModule {}
