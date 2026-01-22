import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'encrypted_aes_key_base64' })
  encryptedKeyOwner: string;
}
