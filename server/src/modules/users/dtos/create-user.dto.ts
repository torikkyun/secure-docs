import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: '122001473' })
  staffId: string;

  @IsString()
  @ApiProperty({ example: 'thisisapassword123' })
  password: string;

  @IsString()
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'CNTT' })
  departmentCode: string;

  @IsString()
  @ApiProperty({ example: 'staff' })
  role: string;
}
