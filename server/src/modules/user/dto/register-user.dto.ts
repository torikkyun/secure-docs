import { IsNotEmpty, IsString } from 'class-validator';
import { LoginDto } from './login-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName: string;
}
