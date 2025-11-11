import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length } from "class-validator";

export class LoginGoogleUserDto {
  @IsEmail()
  @ApiProperty({ example: "nduc42176@gmail.com" })
  email: string;

  @Length(3, 30)
  @ApiProperty({ example: "Đức Trần" })
  username: string;
}
