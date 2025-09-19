import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class RegisterUserDto extends LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  @ApiProperty({ example: 'Đức Trần' })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 25 })
  age: number;
}
