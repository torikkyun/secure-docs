import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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

  @IsString()
  @ApiProperty({ example: "application/pdf" })
  fileType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "encrypted_aes_key_base64" })
  encryptedKeyOwner: string;

  @IsNumber()
  @ApiProperty({ example: 10_485_760 })
  pinSize: number;

  @IsString()
  @ApiProperty({ example: "pinata" })
  pinService: string;
}
