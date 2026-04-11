import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";
import { FileClassification, ContentFlag } from "@/prisma/enums";

export class UploadFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        return [value];
      }
    }
    return value;
  })
  @ApiProperty({
    type: [String],
  })
  wrappedAesKeys: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  @ApiPropertyOptional({
    default: true,
  })
  enableBlockchainLogging?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(FileClassification, { each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @ApiPropertyOptional({
    type: [String],
    enum: FileClassification,
    isArray: true,
  })
  classifications?: FileClassification[];

  @IsOptional()
  @IsArray()
  @IsEnum(ContentFlag, { each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @ApiPropertyOptional({
    type: [String],
    enum: ContentFlag,
    isArray: true,
  })
  contentFlags?: ContentFlag[];
}
