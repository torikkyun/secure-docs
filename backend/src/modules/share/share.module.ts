import { Module } from "@nestjs/common";
import { ShareService } from "./share.service";
import { ShareController } from "./share.controller";
import { FileActivityModule } from "../file-activity/file-activity.module";

@Module({
  imports: [FileActivityModule],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
