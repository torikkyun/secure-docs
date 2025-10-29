import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'a3f1c2b4-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
  })
  id: string;
}
