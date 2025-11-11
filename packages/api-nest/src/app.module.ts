import { JwtGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
// import { RedisModule } from "@core/cache/redis.module";
import { DatabaseModule } from "@core/database/database.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import configuration from "./config/configuration";
import { UserModule } from "./modules/user/user.module";
import { UserRoleModule } from "./modules/user-role/user-role.module";
import { UserStatusModule } from "./modules/user-status/user-status.module";

const guards = [JwtGuard, RolesGuard];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatabaseModule,
    // RedisModule,
    UserRoleModule,
    UserStatusModule,
    UserModule,
  ],
  providers: [
    ...guards.map((Guard) => ({
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new Guard(reflector),
      inject: [Reflector],
    })),
  ],
})
export class AppModule {}
