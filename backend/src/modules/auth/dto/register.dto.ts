import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { LoginDto } from "./login.dto";

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: "John Doe" })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "Passcode phải có đúng 6 ký tự" })
  @ApiProperty({
    minLength: 6,
    maxLength: 6,
    example: "123456",
  })
  passcode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  publicKey: string;
}
