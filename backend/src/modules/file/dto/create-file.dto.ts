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
}
