import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RecipientShareDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  wrappedAesKey: string;
}

export class CreateShareDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipientShareDto)
  recipients: RecipientShareDto[];
}
