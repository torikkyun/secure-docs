import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

export class QueryAccessGrantDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @ApiProperty({ required: false })
  fileId?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  granteeId?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  status?: string;
}
