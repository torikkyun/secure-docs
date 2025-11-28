import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RevokeAccessGrantDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "Siwe message string" })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  signature: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  reason?: string;
}
