import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'duc@gmail.com' })
  email: string;

  @MinLength(2)
  @ApiProperty({ example: 'Duc Nguyen' })
  name: string;

  @IsString()
  @ApiProperty({ example: '123456789' })
  googleId: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;
}
