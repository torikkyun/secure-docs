import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class UpdateStatusDocumentDto {
  @IsUUID()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  statusId: string;
}

export class UpdateStatusDocumentResponseDto {
  id: string;
  filename: string;
  encryptedFilePath: string;
  status: {
    id: string;
    name: string;
  };
  updatedAt: Date;
}
