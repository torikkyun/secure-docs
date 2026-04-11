import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GroupRecipientShareDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wrappedAesKey: string;
}

export class CreateGroupShareDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ type: [GroupRecipientShareDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GroupRecipientShareDto)
  recipients: GroupRecipientShareDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
