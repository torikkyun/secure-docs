import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { LoginDto } from "./login.dto";

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: "John Doe" })
  name: string;
}
