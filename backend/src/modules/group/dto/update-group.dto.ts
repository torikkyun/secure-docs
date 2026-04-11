import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: "Kế toán & Tài chính" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: "Nhóm kế toán và tài chính" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
