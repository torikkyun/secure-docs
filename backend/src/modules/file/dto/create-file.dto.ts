import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";
import { Transform } from "class-transformer";

export class UploadFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
  })
  wrappedAesKeys: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  @ApiPropertyOptional({ default: true })
  enableBlockchainLogging?: boolean;
}
