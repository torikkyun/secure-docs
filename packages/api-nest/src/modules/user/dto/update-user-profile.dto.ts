import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: "John Doe" })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  username?: string;

  @ApiPropertyOptional({
    example: "john@gmail.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
