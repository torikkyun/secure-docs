import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length } from "class-validator";

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: "nduc42176@gmail.com" })
  email: string;

  @Length(6, 20)
  @ApiProperty({ example: "Thisisapassword123" })
  password: string;
}
