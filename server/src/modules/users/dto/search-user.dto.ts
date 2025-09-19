import { PaginationDto } from '@common/dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  email?: string;
}
