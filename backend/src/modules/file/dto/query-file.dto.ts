import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { OffsetPaginationQueryDto } from 'src/common/dto/offset-pagination-query.dto';

export class QueryFileDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @ApiPropertyOptional({
    enum: ['uploaded', 'received', 'all'],
    default: 'uploaded',
  })
  type?: 'uploaded' | 'received' | 'all';

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional()
  sortBy?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  order?: 'asc' | 'desc';
}
