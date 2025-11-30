import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";

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
  @IsNotEmpty()
  @ApiProperty()
  txHash: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  expiresAt: string;
}
