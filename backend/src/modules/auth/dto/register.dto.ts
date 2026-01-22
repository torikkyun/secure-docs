import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Nguyễn Văn A' })
  username: string;

  @IsNotEmpty()
  @Length(6, 6, { message: 'Passcode must be exactly 6 digits' })
  @ApiProperty({ example: '123456' })
  passcode: string;

  @IsNotEmpty()
  @ApiProperty()
  publicKey: string;
}
