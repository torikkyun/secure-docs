import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserStatus } from "./entities/user-status.entity";
import { UserStatusService } from "./user-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserStatus])],
  providers: [UserStatusService],
})
export class UserStatusModule {}
