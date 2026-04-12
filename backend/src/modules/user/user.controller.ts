import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserService } from "./user.service";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  getProfile(@CurrentUser() { id }: AuthUser) {
    return this.userService.getProfile(id);
  }

  @Patch("profile")
  updateProfile(
    @CurrentUser() { id }: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(id, dto);
  }

  @Post("avatar")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = "./uploads/avatars";
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname) || ".jpg";
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new BadRequestException("Chỉ chấp nhận file ảnh"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadAvatar(
    @CurrentUser() { id }: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("Không có file được tải lên");
    return this.userService.updateAvatar(id, file.path);
  }

  @Get()
  findAll(@Query() dto: QueryUserDto) {
    return this.userService.findAll(dto);
  }

  @Get(":userId")
  findById(@Param("userId") userId: string) {
    return this.userService.findById(userId);
  }
}
