import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @ApiProperty({ example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" })
  walletAddress: string;

  @IsNotEmpty()
  @ApiProperty({ example: "john_doe" })
  username: string;

  @IsEmail()
  @ApiProperty({ example: "user@gmail.com" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: "0x..." })
  signature: string;

  @IsNotEmpty()
  @ApiProperty({
    example:
      "Welcome to Secure Docs!\n\nDomain: secure-docs.example.com  \nPurpose: Register wallet for Secure Docs  \nVersion: 1  \nNonce: 8f3d2a1b-5c6e-4f2d-bc89-123456abcdef  \nIssued At: 2025-11-20T08:30:00Z  \nExpires At: 2025-11-20T09:30:00Z",
  })
  message: string;
}
