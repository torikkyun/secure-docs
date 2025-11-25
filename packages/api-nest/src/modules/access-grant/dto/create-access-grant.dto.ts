import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateAccessGrantDto {
  @ApiProperty({ description: "ID of the file to share" })
  @IsUUID()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({ description: "Wallet address of the recipient" })
  @IsString()
  @IsNotEmpty()
  granteeWalletAddress: string;

  @ApiProperty({ description: "Encrypted AES key for the grantee" })
  @IsString()
  @IsNotEmpty()
  encryptedKeyGrantee: string;

  @ApiPropertyOptional({
    description: "Transaction hash of the grant event on blockchain",
  })
  @IsString()
  @IsOptional()
  txHash?: string;

  @ApiPropertyOptional({ description: "Expiration date of the grant" })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
