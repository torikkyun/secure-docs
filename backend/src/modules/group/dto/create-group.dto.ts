import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateGroupDto {
  @ApiProperty({ example: "Kế toán" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: "Nhóm phòng kế toán" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
