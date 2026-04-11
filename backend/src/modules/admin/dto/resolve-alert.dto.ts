import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResolveAlertDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isResolved: boolean;
}
