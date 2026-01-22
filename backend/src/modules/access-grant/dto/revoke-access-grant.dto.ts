import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RevokeAccessGrantDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'No longer needed' })
  reason?: string;
}
