import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @ApiPropertyOptional({ example: 'John Doe' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    example: 'john@gmail.com',
  })
  email?: string;
}
