import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

export class QueryFileDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ["uploaded", "received"],
    default: "uploaded",
  })
  type?: "uploaded" | "received";

  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsOptional()
  @ApiProperty({ required: false, enum: ["asc", "desc"], default: "desc" })
  order?: "asc" | "desc";
}
