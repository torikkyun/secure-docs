import { Module } from "@nestjs/common";
import { FileActivityService } from "./file-activity.service";
import { FileActivityController } from "./file-activity.controller";

@Module({
  controllers: [FileActivityController],
  providers: [FileActivityService],
  exports: [FileActivityService],
})
export class FileActivityModule {}
