import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @ApiPropertyOptional()
  avatar?: string;
}
