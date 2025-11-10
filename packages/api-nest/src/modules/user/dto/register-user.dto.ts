import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { LoginDto } from "./login-user.dto";

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: "John" })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: "Doe" })
  lastName: string;

  @IsOptional()
  @ApiProperty({ example: "1234567890", required: false })
  phoneNumber?: string;
}
