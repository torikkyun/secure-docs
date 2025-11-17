import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

export class QueryUserDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;
}
