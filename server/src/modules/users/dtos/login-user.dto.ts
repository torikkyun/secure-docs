import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  staffId: string;

  @IsString()
  password: string;
}
