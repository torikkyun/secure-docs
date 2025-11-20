import { ApiProperty } from "@nestjs/swagger";

export class UserStorageResponseDto {
  @ApiProperty()
  storageUsed: bigint | number;

  @ApiProperty()
  storageLimit: bigint | number;

  @ApiProperty()
  storageRemaining: bigint | number;
}
