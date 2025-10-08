import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @ApiProperty({ example: '122001473', description: 'Mã nhân viên' })
  staffId: string;

  @IsString()
  @ApiProperty({ example: 'thisisapassword123' })
  password: string;
}
