import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'duc@gmail.com' })
  email: string;

  @MinLength(6)
  @ApiProperty({ example: '123456' })
  password: string;
}
