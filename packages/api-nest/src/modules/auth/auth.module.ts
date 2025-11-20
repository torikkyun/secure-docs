import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "src/common/strategies/jwt.strategy";
import { RedisModule } from "src/infrastructure/cache/redis.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { NonceService } from "./nonce.service";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtConfig = config.get("jwt");
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiration,
          },
        };
      },
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, NonceService],
  exports: [NonceService],
})
export class AuthModule {}
