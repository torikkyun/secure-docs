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

  @ApiProperty({ example: 10_485_760 })
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

  @ApiPropertyOptional({ example: { description: "Important document" } })
  @IsOptional()
  metadata?: any;
}
