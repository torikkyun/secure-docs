import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from '@common/strategies/jwt.strategy';
import { UserRoleModule } from '@modules/user-role/user-role.module';
import { UserRole } from '@modules/user-role/entities/user-role.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION')!,
        },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, UserRole]),
    UserRoleModule,
  ],
  controllers: [UserController, AuthController],
  providers: [JwtModule, JwtStrategy, AuthService, UserService],
})
export class UserModule {}
