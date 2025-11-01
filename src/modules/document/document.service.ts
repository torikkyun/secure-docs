import * as crypto from "node:crypto";
import { StorageService } from "@core/storage/storage.service";
import { DocumentStatus } from "@modules/document-status/entities/document-status.entity";
import { User } from "@modules/user/entities/user.entity";
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QueryDocumentDto } from "./dto/query-document.dto";
import {
  UpdateStatusDocumentDto,
  UpdateStatusDocumentResponseDto,
} from "./dto/update-status-document.dto";
import { UploadDocumentDto } from "./dto/upload-document.dto";
import { Document } from "./entities/document.entity";

const MAX_LIMIT = 100;

@Injectable()
export class DocumentService {
  private readonly documentRepository: Repository<Document>;
  private readonly documentStatusRepository: Repository<DocumentStatus>;
  private readonly storageService: StorageService;

  private uploadedStatus: DocumentStatus | null = null;

  constructor(
    @InjectRepository(Document) documentRepository: Repository<Document>,
    @InjectRepository(DocumentStatus)
    documentStatusRepository: Repository<DocumentStatus>,
    storageService: StorageService
  ) {
    this.documentRepository = documentRepository;
    this.documentStatusRepository = documentStatusRepository;
    this.storageService = storageService;
    this.initUploadedStatus();
  }

  private async initUploadedStatus() {
    this.uploadedStatus = await this.documentStatusRepository.findOne({
      where: { name: "uploaded" },
    });
    if (!this.uploadedStatus) {
      throw new NotFoundException('Không tìm thấy trạng thái "uploaded"');
    }
  }

  async uploadDocument(
    encryptedFile: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    { originalFileHash, isSensitive, sensitiveKeywords }: UploadDocumentDto,
    user: User
  ): Promise<{
    documentId: string;
    originalFileHash: string;
    encryptedFilePath: string;
  }> {
    const encryptedFileHash = crypto
      .createHash("sha256")
      .update(encryptedFile.buffer)
      .digest("hex");

    const savedFilename = `${crypto.randomUUID()}.enc`;
    const bucket = "secure-docs";
    const storage = this.storageService.getClient();

    const { error: uploadError } = (await storage.storage
      .from(bucket)
      .upload(savedFilename, encryptedFile.buffer, {
        contentType: "application/octet-stream",
        upsert: false,
      })) as { error: { message: string } | null };

    if (uploadError) {
      throw new BadGatewayException(
        `Lỗi khi tải tệp lên storage: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } = this.storageService
      .getClient()
      .storage.from(bucket)
      .getPublicUrl(savedFilename);
    const encryptedFilePath = publicUrlData.publicUrl;

    const status = this.uploadedStatus;
    if (!status) {
      throw new NotFoundException('Không tìm thấy trạng thái "uploaded"');
    }

    const document = new Document();
    document.user = user;
    document.filename = encryptedFile.originalname;
    document.fileHash = originalFileHash;
    document.encryptedFilePath = encryptedFilePath;
    document.encryptedFileHash = encryptedFileHash;
    document.encryptionKeyHash = undefined;
    document.isSensitive = isSensitive ?? false;
    document.sensitiveKeywords =
      sensitiveKeywords && sensitiveKeywords.length > 0
        ? sensitiveKeywords
        : undefined;
    document.status = status;

    const savedDocument = await this.documentRepository.save(document);

    return {
      documentId: savedDocument.id,
      originalFileHash,
      encryptedFilePath,
    };
  }

  async findAll(
    { id, role }: User,
    { page, limit, search }: QueryDocumentDto
  ): Promise<{
    data: Document[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(Math.max(1, Number(limit) || 10), MAX_LIMIT);
    const skip = (pageNum - 1) * take;

    const query = this.documentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.user", "user")
      .leftJoinAndSelect("document.status", "status")
      .select([
        "document.id",
        "document.filename",
        "document.encryptedFilePath",
        "document.isSensitive",
        "document.sensitiveKeywords",
        "document.createdAt",
        "document.updatedAt",
        "user.id",
        "user.fullName",
        "user.email",
        "status.id",
        "status.name",
      ])
      .orderBy("document.createdAt", "DESC")
      .skip(skip)
      .take(take);

    if (role.name === "staff") {
      query.andWhere("user.id = :userId", { userId: id });
    }

    if (search) {
      query.andWhere(
        "(document.filename ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page: pageNum, limit: take };
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ["user", "status"],
      select: {
        id: true,
        filename: true,
        encryptedFilePath: true,
        isSensitive: true,
        sensitiveKeywords: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          fullName: true,
          email: true,
        },
        status: {
          id: true,
          name: true,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Không tìm thấy tài liệu với ID ${id}`);
    }

    return document;
  }

  async updateStatus(
    documentId: string,
    updateStatusDto: UpdateStatusDocumentDto
  ): Promise<UpdateStatusDocumentResponseDto> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ["status"],
    });

    if (!document) {
      throw new NotFoundException(
        `Không tìm thấy tài liệu với ID ${documentId}`
      );
    }

    const newStatus = await this.documentStatusRepository.findOne({
      where: { id: updateStatusDto.statusId },
    });

    if (!newStatus) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái với ID ${updateStatusDto.statusId}`
      );
    }

    document.status = newStatus;
    await this.documentRepository.save(document);

    return {
      id: document.id,
      filename: document.filename,
      encryptedFilePath: document.encryptedFilePath,
      status: {
        id: newStatus.id,
        name: newStatus.name,
      },
      updatedAt: document.updatedAt,
    };
  }
}
