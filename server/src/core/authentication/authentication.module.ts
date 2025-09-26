import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@core/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION')!,
        },
      }),
    }),
  ],
  providers: [AuthenticationService, PrismaService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
