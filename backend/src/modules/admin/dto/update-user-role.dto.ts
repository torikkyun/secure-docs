import { IsString, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserRoleDto {
  @ApiProperty({ example: "manager", description: "admin | manager | user" })
  @IsString()
  @IsIn(["admin", "manager", "user"])
  role: string;
}
