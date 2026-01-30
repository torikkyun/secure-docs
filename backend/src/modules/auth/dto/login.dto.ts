import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: "user@gmail.com" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: "Thisisapassword123" })
  password: string;
}
