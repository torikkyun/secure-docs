import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TargetType } from "./entities/target-type.entity";
import { TargetTypeController } from "./target-type.controller";
import { TargetTypeService } from "./target-type.service";

@Module({
  imports: [TypeOrmModule.forFeature([TargetType])],
  controllers: [TargetTypeController],
  providers: [TargetTypeService],
})
export class TargetTypeModule {}
