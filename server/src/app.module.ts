import { SeedDatabaseCommand } from '@commands/seed-database.command';
import { AuthenticationModule } from '@core/authentication/authentication.module';
import { PrismaService } from '@core/prisma/prisma.service';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@core/redis/redis.module';
import { RolesGuard } from '@core/authentication/guards/roles.guard';
import { JwtGuard } from '@core/authentication/guards/jwt.guard';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}.local`],
      expandVariables: true,
    }),
    AuthenticationModule,
    UsersModule,
    RedisModule,
    AuditLogsModule,
  ],
  providers: [
    SeedDatabaseCommand,
    PrismaService,
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
