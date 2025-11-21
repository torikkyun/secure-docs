import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UploadFileDto {
  @ApiProperty({ example: "0x1234567890abcdef..." })
  @IsNotEmpty()
  @IsString()
  fileHash: string;

  @ApiProperty({ example: "QmX4k3qVvQ7ZJqPZ..." })
  @IsNotEmpty()
  @IsString()
  cid: string;

  @ApiProperty({ example: "document.pdf" })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 10485760 })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional({ example: "application/pdf" })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({ example: "encrypted_aes_key_base64" })
  @IsNotEmpty()
  @IsString()
  encryptedKeyOwner: string;

  @ApiPropertyOptional({ example: "kms_encrypted_key_base64" })
  @IsOptional()
  @IsString()
  kmsEncryptedKey?: string;

  @ApiPropertyOptional({ example: "0xabcdef1234567890..." })
  @IsOptional()
  @IsString()
  txHash?: string;

  @ApiPropertyOptional({ example: 12345 })
  @IsOptional()
  @IsNumber()
  blockchainFileId?: number;

  @ApiPropertyOptional({ example: { description: "Important document" } })
  @IsOptional()
  metadata?: any;
}
