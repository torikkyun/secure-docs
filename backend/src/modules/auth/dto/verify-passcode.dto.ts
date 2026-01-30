import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Length } from "class-validator";

export class VerifyPasscodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "Passcode phải có đúng 6 ký tự" })
  @ApiProperty({
    minLength: 6,
    maxLength: 6,
    example: "123456",
  })
  passcode: string;
}
