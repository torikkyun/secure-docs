import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateAccessGrantDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  fileId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  granteeWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  encryptedKeyGrantee: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  txHash?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  expiresAt?: string;
}
