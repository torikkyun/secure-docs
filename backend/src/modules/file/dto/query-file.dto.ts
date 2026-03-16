import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

export class QueryFileDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ["all", "shared", "owned"] })
  filter?: "all" | "shared" | "owned";

  @IsOptional()
  @IsString()
  @IsIn(["filename", "createdAt", "size"])
  @ApiPropertyOptional({ enum: ["filename", "createdAt", "size"] })
  sortBy?: "filename" | "createdAt" | "size";

  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  sortOrder?: "asc" | "desc";
}
