import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PrepareUploadDto {
  @ApiProperty({ example: "document.pdf" })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 10485760 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fileSize: number;

  @ApiPropertyOptional({ example: "application/pdf" })
  @IsOptional()
  @IsString()
  fileType?: string;
}
