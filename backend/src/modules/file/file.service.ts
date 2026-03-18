import {
  Injectable,
  BadRequestException,
  NotFoundException,
  StreamableFile,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { PrismaService } from "src/database/prisma.service";
import { FileActivityAction } from "generated/prisma/enums";
import { UploadFilesDto } from "./dto/create-file.dto";
import { QueryFileDto } from "./dto/query-file.dto";
import { Prisma } from "generated/prisma/client";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { FileActivityService } from "../file-activity/file-activity.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { VersionedCache } from "src/infrastructure/cache/decorators/versioned-cache.decorator";
import type { Cache } from "cache-manager";
import { CacheVersionService } from "src/infrastructure/cache/cache-version.service";

@Injectable()
export class FileService {
  constructor(
    @Inject(CACHE_MANAGER)
    public readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly fileActivity: FileActivityService,
    private readonly cacheVersion: CacheVersionService,
  ) {}

  private isOwner(file: { ownerId: string }, userId: string): boolean {
    return file.ownerId === userId;
  }

  private async resolveDownloadPermission(fileId: string, userId: string) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        OR: [
          { ownerId: userId },
          { shares: { some: { recipientId: userId } } },
        ],
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        filePath: true,
        ownerId: true,
        wrappedAesKey: true,
        enableBlockchainLogging: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            publicKey: true,
          },
        },
        shares: {
          where: { recipientId: userId },
          select: {
            wrappedAesKey: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(
        "Không tìm thấy file hoặc không có quyền truy cập",
      );
    }

    const isOwner = file.ownerId === userId;

    const wrappedAesKey = isOwner
      ? file.wrappedAesKey
      : file.shares[0]?.wrappedAesKey;

    if (!wrappedAesKey) {
      throw new ForbiddenException("Không tìm thấy khóa giải mã hợp lệ");
    }

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException("Không tìm thấy dữ liệu file trên máy chủ");
    }

    return {
      file,
      isOwner,
      wrappedAesKey,
    };
  }

  async createFile(
    files: Express.Multer.File[],
    dto: UploadFilesDto,
    userId: string,
    req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Không có file được tải lên");
    }

    if (files.length !== dto.wrappedAesKeys.length) {
      throw new BadRequestException(
        "Số lượng khóa AES không khớp với số lượng file",
      );
    }

    const uploadsDir = path.join(process.cwd(), "uploads", "files");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const enableBlockchainLogging = dto.enableBlockchainLogging ?? true;

    const results = await Promise.all(
      files.map(async (file, index) => {
        const wrappedAesKey = dto.wrappedAesKeys[index];

        if (!wrappedAesKey) {
          throw new BadRequestException(
            `Thiếu khóa AES cho file: ${file.originalname}`,
          );
        }

        if (!fs.existsSync(file.path)) {
          throw new BadRequestException(`File not found: ${file.originalname}`);
        }

        const record = await this.prisma.file.create({
          data: {
            ownerId: userId,
            filename: file.originalname,
            filePath: file.path,
            wrappedAesKey,
            mimeType: file.mimetype,
            size: BigInt(file.size),
            enableBlockchainLogging,
          },
        });

        // Bump cache version cho file cụ thể
        await this.cacheVersion.bump(`files:file:${record.id}:version`);
        await this.cacheVersion.bump(`file-activity:file:${record.id}:version`);

        return {
          id: record.id,
          filename: record.filename,
          mimeType: record.mimeType,
          size: record.size.toString(),
          createdAt: record.createdAt,
        };
      }),
    );

    // Bump cache version cho danh sách files của user (chỉ 1 lần)
    await this.cacheVersion.bump(`files:user:${userId}:version`);
    await this.cacheVersion.bump(`file-activity:user:${userId}:version`);

    return results;
  }

  @VersionedCache({
    prefix: "files",
    versionKey: (args) => `files:user:${args[0]}:version`,
    ttl: 60000,
  })
  async getUserFiles(
    userId: string,
    {
      page = 1,
      limit = 20,
      search,
      filter,
      sortBy = "createdAt",
      sortOrder = "desc",
      fileType,
      ownerId,
      sharedWithId,
    }: QueryFileDto,
  ) {
    const { take, skip } = getOffsetPagination(page, limit);

    let accessFilter: Prisma.FileWhereInput = {};

    if (sharedWithId) {
      // Lọc file hiện tại user sở hữu và đã chia sẻ với sharedWithId
      accessFilter = {
        ownerId: userId,
        shares: { some: { recipientId: sharedWithId } },
      };
    } else if (filter === "shared") {
      accessFilter = { shares: { some: { recipientId: userId } } };
    } else if (filter === "owned") {
      accessFilter = { ownerId: userId };
    } else {
      // Default: 'all' (owned OR shared)
      accessFilter = {
        OR: [
          { ownerId: userId },
          { shares: { some: { recipientId: userId } } },
        ],
      };
    }

    const searchFilter = search
      ? {
          AND: {
            OR: [
              {
                filename: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                owner: {
                  name: {
                    contains: search,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                },
              },
              {
                owner: {
                  email: {
                    contains: search,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                },
              },
            ],
          },
        }
      : {};

    let fileTypeFilter: Prisma.FileWhereInput = {};
    if (fileType === "pdf") {
      fileTypeFilter = { mimeType: "application/pdf" };
    } else if (fileType === "word") {
      fileTypeFilter = {
        mimeType: {
          in: [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
          ],
        },
      };
    } else if (fileType === "excel") {
      fileTypeFilter = {
        mimeType: {
          in: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/vnd.ms-excel.sheet.macroEnabled.12",
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
          ],
        },
      };
    } else if (fileType === "image") {
      fileTypeFilter = { mimeType: { startsWith: "image/" } };
    }

    const where: Prisma.FileWhereInput = {
      AND: [
        { isDeleted: false },
        accessFilter,
        ...(search ? [searchFilter] : []),
        ...(fileType ? [fileTypeFilter] : []),
        ...(ownerId ? [{ ownerId }] : []),
      ],
    };

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        select: {
          id: true,
          filename: true,
          mimeType: true,
          size: true,
          wrappedAesKey: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          shares: {
            select: {
              id: true,
              wrappedAesKey: true,
              createdAt: true,
              recipientId: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              recipient: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
        where,
        skip,
        take,
      }),
      this.prisma.file.count({ where }),
    ]);

    const mapped = files.map((file) => {
      const owner = this.isOwner(file, userId);
      const myShare = owner
        ? null
        : file.shares.find((s) => s.recipientId === userId);
      return {
        ...file,
        size: file.size.toString(),
        isOwner: owner,
        wrappedAesKey: owner ? file.wrappedAesKey : myShare?.wrappedAesKey,
        sharedBy: owner ? null : file.owner,
        sharedWith: owner ? file.shares.map((s) => s.recipient) : undefined,
        shares: file.shares.map(
          ({ recipientId: _rid, wrappedAesKey: _wak, ...rest }) => rest,
        ),
      };
    });

    return {
      files: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @VersionedCache({
    prefix: "files:file",
    versionKey: (args) => `files:file:${args[0]}:version`,
    ttl: 300000,
  })
  async getFileById(fileId: string, userId: string) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        OR: [
          { ownerId: userId },
          { shares: { some: { recipientId: userId } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        shares: {
          where: { recipientId: userId },
          select: {
            wrappedAesKey: true,
            recipient: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(
        "Không tìm thấy file hoặc không có quyền truy cập",
      );
    }

    const isOwner = file.ownerId === userId;

    let sharedWith:
      | {
          id: string;
          name: string;
          email: string;
          avatar: string;
        }[]
      | undefined;

    if (isOwner) {
      const shares = await this.prisma.share.findMany({
        where: { fileId },
        select: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      sharedWith = shares.map((s) => s.recipient);
    }

    return {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size.toString(),
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      isOwner,
      wrappedAesKey: isOwner
        ? file.wrappedAesKey
        : file.shares[0]?.wrappedAesKey,
      owner: file.owner,
      sharedWith,
    };
  }

  async getFileForDownload(fileId: string, userId: string) {
    const { file, isOwner, wrappedAesKey } =
      await this.resolveDownloadPermission(fileId, userId);

    return {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size.toString(),
      owner: file.owner,
      isOwner,
      wrappedAesKey,
    };
  }

  async downloadFile(
    fileId: string,
    userId: string,
    res: Response,
    req: Request,
  ): Promise<StreamableFile> {
    const { file, isOwner, wrappedAesKey } =
      await this.resolveDownloadPermission(fileId, userId);

    /**
     * Log blockchain (recipient only)
     */
    if (!isOwner) {
      await this.fileActivity.logFileActivity(
        {
          userId,
          fileId: file.id,
          action: FileActivityAction.DOWNLOAD,
          metadata: {
            filename: file.filename,
            downloadedByRecipient: true,
          },
          req,
        },
        file.enableBlockchainLogging ?? true,
      );

      // Bump cache version cho file activities
      await this.cacheVersion.bump(`file-activity:user:${userId}:version`);
      await this.cacheVersion.bump(`file-activity:file:${file.id}:version`);
    }

    const fileStream = fs.createReadStream(file.filePath);

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Content-Length": file.size.toString(),

      /**
       * ⚠️ SECURITY NOTE
       * Header có thể bị log → chỉ dùng nếu bạn chấp nhận risk
       */
      // "X-Wrapped-AES-Key": wrappedAesKey,
      "X-File-ID": file.id,
      "X-Is-Owner": isOwner.toString(),
    });

    return new StreamableFile(fileStream);
  }

  async deleteFile(fileId: string, userId: string, req: Request) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: userId,
        isDeleted: false,
      },
      include: {
        shares: {
          select: { recipientId: true },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(
        "Không tìm thấy file hoặc không có quyền truy cập",
      );
    }

    const recipientIds = file.shares.map((s) => s.recipientId);

    await this.fileActivity.logFileActivity({
      userId,
      fileId,
      action: FileActivityAction.DELETE,
      metadata: {
        filename: file.filename,
      },
      req,
    });

    // Cập nhật DB trước, chỉ xóa file vật lý sau khi DB thành công
    await this.prisma.$transaction([
      this.prisma.file.update({
        where: { id: fileId },
        data: { isDeleted: true },
      }),
      this.prisma.share.deleteMany({
        where: { fileId },
      }),
    ]);

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await this.cacheVersion.bump(`files:user:${userId}:version`);
    await this.cacheVersion.bump(`files:file:${fileId}:version`);
    await this.cacheVersion.bump(`file-activity:user:${userId}:version`);
    await this.cacheVersion.bump(`file-activity:file:${fileId}:version`);

    // Invalidate cache cho tất cả recipient đã nhận share
    await Promise.all(
      recipientIds.map((id) =>
        this.cacheVersion.bump(`files:user:${id}:version`),
      ),
    );

    return { message: "Xóa file thành công" };
  }
}
