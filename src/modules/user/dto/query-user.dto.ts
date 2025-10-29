import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;
}
