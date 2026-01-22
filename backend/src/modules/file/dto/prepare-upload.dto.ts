import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PrepareUploadDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'document.pdf' })
  fileName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10_485_760 })
  fileSize: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'application/pdf' })
  fileType?: string;
}
