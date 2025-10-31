import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentStatus } from '@modules/document-status/entities/document-status.entity';
import { User } from '@modules/user/entities/user.entity';
import * as crypto from 'crypto';
import { StorageService } from '@core/storage/storage.service';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepository: Repository<DocumentStatus>,
    private readonly storageService: StorageService,
  ) {}

  async uploadDocument(
    encryptedFile: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    {
      filename,
      originalFileHash,
      isSensitive,
      sensitiveKeywords,
    }: UploadDocumentDto,
    user: User,
  ): Promise<{
    documentId: string;
    originalFileHash: string;
    encryptedFilePath: string;
  }> {
    const encryptedFileHash = crypto
      .createHash('sha256')
      .update(encryptedFile.buffer)
      .digest('hex');

    const savedFilename = `${crypto.randomUUID()}.enc`;
    const bucket = 'secure-docs';
    const storage = this.storageService.getClient();

    const { error: uploadError } = (await storage.storage
      .from(bucket)
      .upload(savedFilename, encryptedFile.buffer, {
        contentType: 'application/octet-stream',
        upsert: false,
      })) as { error: { message: string } | null };

    if (uploadError) {
      throw new BadGatewayException(
        'Lỗi khi tải tệp lên storage: ' + uploadError.message,
      );
    }

    const { data: publicUrlData } = this.storageService
      .getClient()
      .storage.from(bucket)
      .getPublicUrl(savedFilename);
    const encryptedFilePath = publicUrlData.publicUrl;

    const status = await this.documentStatusRepository.findOne({
      where: { name: 'uploaded' },
    });

    const document = new Document();
    document.user = user;
    document.filename = filename;
    document.fileHash = originalFileHash;
    document.encryptedFilePath = encryptedFilePath;
    document.encryptedFileHash = encryptedFileHash;
    document.encryptionKeyHash = undefined;
    document.isSensitive = isSensitive ?? false;
    document.sensitiveKeywords =
      sensitiveKeywords && sensitiveKeywords.length > 0
        ? sensitiveKeywords
        : undefined;
    document.status = status!;

    const savedDocument = await this.documentRepository.save(document);

    return {
      documentId: savedDocument.id,
      originalFileHash,
      encryptedFilePath,
    };
  }

  async findAll(
    { id, role }: User,
    { page, limit, search }: QueryDocumentDto,
  ): Promise<{
    data: Document[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (pageNum - 1) * take;

    const query = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.user', 'user')
      .leftJoinAndSelect('document.status', 'status')
      .select([
        'document.id',
        'document.filename',
        'document.encryptedFilePath',
        'document.isSensitive',
        'document.sensitiveKeywords',
        'document.createdAt',
        'document.updatedAt',
        'user.id',
        'user.fullName',
        'user.email',
        'status.id',
        'status.name',
      ])
      .orderBy('document.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (role.name === 'staff') {
      query.andWhere('user.id = :userId', { userId: id });
    }

    if (search) {
      query.andWhere(
        '(document.filename ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page: pageNum, limit: take };
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['user', 'status'],
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
}
