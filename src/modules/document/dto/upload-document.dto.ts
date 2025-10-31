import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class UploadDocumentDto {
  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    description: "SHA-256 hash của file gốc (64 ký tự hex)",
  })
  originalFileHash: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value === undefined ? false : Boolean(value)))
  @ApiPropertyOptional({ example: false, default: false })
  isSensitive?: boolean = false;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @ApiPropertyOptional({
    example: ["mật khẩu", "CMND"],
    description: "Array của từ khóa nhạy cảm phát hiện được",
  })
  sensitiveKeywords?: string[];
}
