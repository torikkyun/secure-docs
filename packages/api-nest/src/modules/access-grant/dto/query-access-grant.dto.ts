import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

export class QueryAccessGrantDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @ApiPropertyOptional()
  fileId?: string;

  @IsOptional()
  @ApiPropertyOptional()
  granteeId?: string;

  @IsOptional()
  @ApiPropertyOptional()
  status?: string;
}
