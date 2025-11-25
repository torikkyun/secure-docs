import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CompleteDownloadDto {
  @ApiProperty({
    description: "Whether the download was successful",
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: "The size of the file downloaded in bytes",
    example: 1024,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bytesDownloaded?: number;

  @ApiProperty({
    description: "Error message if download failed",
    example: "Network error",
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
