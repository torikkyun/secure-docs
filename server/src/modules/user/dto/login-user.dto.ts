import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ example: 'Thisisapassword123' })
  password: string;
}
