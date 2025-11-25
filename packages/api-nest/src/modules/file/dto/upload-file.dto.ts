import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "0x1234567890abcdef..." })
  fileHash: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "QmX4k3qVvQ7ZJqPZ..." })
  cid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "document.pdf" })
  fileName: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 10_485_760 })
  fileSize: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "application/pdf" })
  fileType?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "encrypted_aes_key_base64" })
  encryptedKeyOwner: string;

  @IsOptional()
  @ApiPropertyOptional()
  metadata?: unknown;
}
