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
  @ApiProperty({ example: "I am registering my wallet for Secure Docs" })
  message: string;
}
