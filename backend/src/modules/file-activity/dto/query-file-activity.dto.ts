import { OffsetPaginationQueryDto } from "@/common/dto/offset-pagination-query.dto";
import { IsOptional, IsEnum } from "class-validator";
import { FileActivityAction } from "@/prisma/enums";

export class QueryFileActivityDto extends OffsetPaginationQueryDto {
  @IsOptional()
  @IsEnum(FileActivityAction)
  action?: FileActivityAction;
}
