import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

const PASSWORD_MIN_LENGTH = 6;

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: "user@gmail.com" })
  email: string;

  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  @ApiProperty({ example: "Thisisapassword123" })
  password: string;
}
