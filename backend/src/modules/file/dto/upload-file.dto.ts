import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'document_1234567890.pdf' })
  fileName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'document.pdf' })
  originalFileName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '/uploads/2026/01/document_1234567890.pdf' })
  filePath: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 10_485_760 })
  fileSize: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'pdf' })
  fileType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'a3f5d8e9c1b2...' })
  fileHash: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'encrypted_aes_key_base64' })
  encryptedKeyOwner: string;
}
