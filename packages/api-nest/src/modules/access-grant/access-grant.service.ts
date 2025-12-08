import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { serializeBigInt } from "src/common/utils/bigint.util";
import { getOffsetPagination } from "src/common/utils/pagination.util";
import { PrismaService } from "src/database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateAccessGrantDto } from "./dto/create-access-grant.dto";
import { QueryAccessGrantDto } from "./dto/query-access-grant.dto";
import { RevokeAccessGrantDto } from "./dto/revoke-access-grant.dto";

@Injectable()
export class AccessGrantService {
  private readonly prisma: PrismaService;
  private readonly auditService: AuditService;

  constructor(prisma: PrismaService, auditService: AuditService) {
    this.prisma = prisma;
    this.auditService = auditService;
  }

  async create(
    userId: string,
    {
      fileId,
      granteeWalletAddress,
      encryptedKeyGrantee,
      txHash,
      signature,
      expiresAt,
    }: CreateAccessGrantDto,
    ipAddress: string,
    userAgent: string
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new NotFoundException("Không tìm thấy file");
    }
    if (file.ownerId !== userId) {
      throw new ForbiddenException("Bạn không phải chủ sở hữu file");
    }

    const grantee = await this.prisma.user.findUnique({
      where: { walletAddress: granteeWalletAddress },
    });
    if (!grantee) {
      throw new NotFoundException("Không tìm thấy người nhận quyền truy cập");
    }
    if (grantee.id === userId) {
      throw new BadRequestException(
        "Không thể cấp quyền truy cập cho chính bạn"
      );
    }

    const status = await this.prisma.accessGrantStatus.findUnique({
      where: { name: "active" },
    });
    if (!status) {
      throw new NotFoundException("Không tìm thấy trạng thái");
    }

    const existingGrant = await this.prisma.accessGrant.findUnique({
      where: {
        idx_unique_grant: {
          fileId,
          granteeId: grantee.id,
        },
      },
    });

    if (existingGrant && existingGrant.statusId === status.id) {
      throw new ConflictException("Quyền truy cập đã tồn tại");
    }

    const grant = await this.prisma.accessGrant.create({
      data: {
        fileId,
        grantorId: userId,
        granteeId: grantee.id,
        encryptedKeyGrantee,
        txHash,
        signature,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        statusId: status.id,
      },
      include: {
        file: true,
        grantor: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
        grantee: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    // Audit Log: FILE_SHARE
    await this.auditService.log({
      userId,
      eventType: "FILE_SHARE",
      fileId,
      targetUserId: grantee.id,
      eventData: {
        grantId: grant.id,
        expiresAt: grant.expiresAt,
      },
      blockchainTxHash: txHash,
      ipAddress,
      userAgent,
    });

    return serializeBigInt(grant);
  }

  async findAll(
    userId: string,
    {
      fileId,
      granteeId,
      type,
      status,
      page = 1,
      limit = 20,
    }: QueryAccessGrantDto
  ) {
    const { skip, take } = getOffsetPagination(page, limit);
    const where: Prisma.AccessGrantWhereInput = {
      OR: [{ grantorId: userId }, { granteeId: userId }],
    };
    if (fileId) {
      where.fileId = fileId;
    }
    if (granteeId) {
      where.granteeId = granteeId;
    }
    if (status) {
      where.status = {
        name: status,
      };
    }

    if (type) {
      if (type === "given") {
        where.grantorId = userId;
      } else if (type === "received") {
        where.granteeId = userId;
      }
    }

    const [grants, total] = await Promise.all([
      this.prisma.accessGrant.findMany({
        where,
        skip,
        take,
        orderBy: { grantedAt: "desc" },
        select: {
          id: true,
          txHash: true,
          expiresAt: true,
          grantedAt: true,
          file: {
            select: {
              id: true,
              fileName: true,
              fileSize: true,
            },
          },
          grantor: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
            },
          },
          grantee: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.accessGrant.count({ where }),
    ]);

    return {
      grants: serializeBigInt(grants),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const grant = await this.prisma.accessGrant.findUnique({
      where: { id },
      select: {
        id: true,
        encryptedKeyGrantee: true,
        txHash: true,
        expiresAt: true,
        grantedAt: true,
        file: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
          },
        },
        grantor: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
        grantee: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
        revokedAt: true,
        revokeReason: true,
        revokeSignature: true,
      },
    });

    if (!grant) {
      throw new NotFoundException("Quyền truy cập không tồn tại");
    }

    if (grant.grantor.id !== userId && grant.grantee.id !== userId) {
      throw new ForbiddenException(
        "Bạn không có quyền cập nhật quyền truy cập này"
      );
    }

    return serializeBigInt(grant);
  }

  async revoke(
    userId: string,
    id: string,
    revokeAccessGrantDto: RevokeAccessGrantDto,
    ipAddress: string,
    userAgent: string
  ) {
    const grant = await this.prisma.accessGrant.findUnique({
      where: { id },
      select: {
        id: true,
        grantor: {
          select: {
            id: true,
          },
        },
        status: {
          select: {
            name: true,
          },
        },
        file: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!grant) {
      throw new NotFoundException("Quyền truy cập không tồn tại");
    }

    if (grant.grantor.id !== userId) {
      throw new ForbiddenException("Bạn không có quyền hủy quyền truy cập này");
    }

    if (grant.status.name === "revoked") {
      throw new ConflictException("Quyền truy cập này đã bị hủy");
    }

    const updatedGrant = await this.prisma.accessGrant.update({
      where: { id },
      data: {
        status: {
          connect: {
            name: "revoked",
          },
        },
        revokedAt: new Date(),
        revokeReason: revokeAccessGrantDto.reason,
        revokeSignature: revokeAccessGrantDto.signature,
      },
    });

    // Audit Log: FILE_REVOKE
    await this.auditService.log({
      userId,
      eventType: "FILE_REVOKE",
      fileId: grant.file.id,
      eventData: {
        grantId: id,
        reason: revokeAccessGrantDto.reason,
      },
      signature: revokeAccessGrantDto.signature,
      ipAddress,
      userAgent,
    });

    return {
      revokedAt: updatedGrant.revokedAt,
    };
  }

  async verify(userId: string, id: string) {
    const grant = await this.prisma.accessGrant.findUnique({
      where: { id },
      select: {
        id: true,
        expiresAt: true,
        grantedAt: true,
        grantor: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
          },
        },
        grantee: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!grant) {
      throw new NotFoundException("Không tìm thấy quyền truy cập");
    }

    if (grant.grantor.id !== userId && grant.grantee.id !== userId) {
      throw new ForbiddenException(
        "Bạn không có quyền xác nhận quyền truy cập này"
      );
    }

    const isExpired = grant.expiresAt && new Date() > grant.expiresAt;
    const isRevoked = grant.status.name === "revoked";
    const isValid = !(isExpired || isRevoked);

    return {
      valid: isValid,
      verifications: {
        notExpired: !isExpired,
        notRevoked: !isRevoked,
      },
    };
  }
}
