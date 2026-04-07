import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { OffsetPaginationQueryDto } from "@/common/dto/offset-pagination-query.dto";

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

  @IsOptional()
  @IsString()
  @IsIn(["pdf", "word", "excel", "image"])
  @ApiPropertyOptional({ enum: ["pdf", "word", "excel", "image"] })
  fileType?: "pdf" | "word" | "excel" | "image";

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  ownerId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  sharedWithId?: string;
}
