import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginWalletDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "Siwe message string" })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "0xsignature..." })
  signature: string;
}
