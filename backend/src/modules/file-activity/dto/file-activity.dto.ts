import { ApiProperty } from "@nestjs/swagger";
import { FileActivityAction } from "generated/prisma/enums";
import { OffsetPaginationQueryDto } from "src/common/dto/offset-pagination-query.dto";

/**
 * DTOs for File Activity API
 */

export class QueryFileActivityDto extends OffsetPaginationQueryDto {
  // Inherits page and limit from OffsetPaginationQueryDto
}

/**
 * Response DTOs with proper typing
 */

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  avatar?: string;
}

export class FileInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimeType: string;
}

// Base activity response
export class BaseFileActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: FileActivityAction })
  action: FileActivityAction;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ type: FileInfoDto, required: false })
  file?: FileInfoDto;

  @ApiProperty({ required: false })
  blockchainTxHash?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  ipAddress?: string | null;

  @ApiProperty({ required: false })
  userAgent?: string | null;
}

// SHARE specific response
export class ShareActivityDto extends BaseFileActivityDto {
  @ApiProperty({ type: [UserInfoDto] })
  recipients: UserInfoDto[];

  @ApiProperty()
  shareCount: number;

  @ApiProperty({ type: [String], required: false })
  warnings?: string[];
}

// DOWNLOAD specific response
export class DownloadActivityDto extends BaseFileActivityDto {
  @ApiProperty()
  downloadedBy: UserInfoDto;
}

// UPLOAD specific response
export class UploadActivityDto extends BaseFileActivityDto {
  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: string;
}

// Union type for all activities
export type FileActivityDto =
  | ShareActivityDto
  | DownloadActivityDto
  | UploadActivityDto
  | BaseFileActivityDto;

// Paginated response
export class PaginatedFileActivitiesDto {
  @ApiProperty({ type: [BaseFileActivityDto] })
  data: FileActivityDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
