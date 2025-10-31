import { Module } from '@nestjs/common';
import { TargetTypeService } from './target-type.service';
import { TargetTypeController } from './target-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetType } from './entities/target-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TargetType])],
  controllers: [TargetTypeController],
  providers: [TargetTypeService],
})
export class TargetTypeModule {}
