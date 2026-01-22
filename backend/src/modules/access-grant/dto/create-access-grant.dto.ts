import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAccessGrantDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  fileId: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@example.com' })
  granteeEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  encryptedKeyGrantee: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  expiresAt: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  passcode: string;
}
