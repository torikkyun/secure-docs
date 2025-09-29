import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@core/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule],
  providers: [AuthenticationService, PrismaService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
