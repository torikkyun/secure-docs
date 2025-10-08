import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  staffId: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  department: string;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  managerId?: string;
}
