import { JwtStrategy } from "@common/strategies/jwt.strategy";
import { DatabaseModule } from "@core/database/database.module";
import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { User } from "./entities/user.entity";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
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
  controllers: [AuthController, UserController],
  providers: [JwtStrategy, AuthService, UserService],
})
export class UserModule {}
