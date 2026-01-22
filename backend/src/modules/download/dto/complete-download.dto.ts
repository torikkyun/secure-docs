import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteDownloadDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: 1024,
  })
  bytesDownloaded?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Network error',
  })
  errorMessage?: string;
}
