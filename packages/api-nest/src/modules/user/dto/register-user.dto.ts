import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { LoginUserDto } from "./login-user.dto";

export class RegisterUserDto extends LoginUserDto {
  @IsString()
  @ApiProperty({
    example: "john_doe",
  })
  username: string;
}
