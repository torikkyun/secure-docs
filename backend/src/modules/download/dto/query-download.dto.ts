import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { OffsetPaginationQueryDto } from 'src/common/dto/offset-pagination-query.dto';

export class QueryDownloadDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string;
}
