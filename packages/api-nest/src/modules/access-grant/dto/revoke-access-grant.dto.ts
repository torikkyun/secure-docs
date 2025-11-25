import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class RevokeAccessGrantDto {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  revokeMessage: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  signature: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  reason?: string;
}
