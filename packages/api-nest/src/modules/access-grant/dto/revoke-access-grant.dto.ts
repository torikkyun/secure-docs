import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class RevokeAccessGrantDto {
  @ApiProperty({ description: "Revocation message signed by the grantor" })
  @IsObject()
  @IsNotEmpty()
  revokeMessage: Record<string, unknown>;

  @ApiProperty({ description: "Signature of the revocation message" })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiPropertyOptional({ description: "Reason for revocation" })
  @IsString()
  @IsOptional()
  reason?: string;
}
