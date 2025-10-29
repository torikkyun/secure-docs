import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'document.pdf' })
  filename: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'abc123...',
  })
  originalFileHash?: string;
}
