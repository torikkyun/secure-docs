import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InputJsonValue } from "@prisma/client/runtime/client";
import { IsOptional, IsUUID } from "class-validator";

export class CreateAuditDto {
  @IsUUID()
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  userId: string;

  @IsUUID()
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  eventType: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  fileId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  targetUserId?: string;

  @ApiProperty({ example: "{}" })
  eventData: InputJsonValue;

  @IsOptional()
  @ApiPropertyOptional({ example: "0x123e4567e89b12d3a456426614174000" })
  signature?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: "0x123e4567e89b12d3a456426614174000" })
  blockchainTxHash?: string;

  @ApiProperty({ example: "127.0.0.1" })
  ipAddress: string;

  @ApiProperty({
    example:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  })
  userAgent: string;
}
