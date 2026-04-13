import { OffsetPaginationQueryDto } from "@/common/dto/offset-pagination-query.dto";
import { IsOptional, IsEnum, IsDateString } from "class-validator";
import { FileActivityAction } from "@/prisma/enums";

export class QueryFileActivityDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @IsEnum(FileActivityAction)
  action?: FileActivityAction;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
