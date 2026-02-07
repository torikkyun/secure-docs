import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: "usera@gmail.com" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: "123456" })
  password: string;
}
