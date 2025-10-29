import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DlpRuleService } from '@modules/dlp-rule/dlp-rule.service';
import { DocumentStatus } from '@modules/document-status/entities/document-status.entity';
import { User } from '@modules/user/entities/user.entity';
import * as crypto from 'crypto';
import { StorageService } from '@core/storage/storage.service';
import { QueryDocumentDto } from './dto/query-document.dto';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepository: Repository<DocumentStatus>,
    private readonly dlpRuleService: DlpRuleService,
    private readonly storageService: StorageService,
  ) {}

  async uploadDocument(
    file: UploadedFile,
    filename: string,
    originalFileHash: string | undefined,
    user: User,
  ): Promise<{
    documentId: string;
  }> {
    const encryptedFileHash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    const fileExtension = filename.substring(filename.lastIndexOf('.'));
    const savedFilename = `${crypto.randomUUID()}${fileExtension}`;
    const bucket = 'secure-docs';
    const storage = this.storageService.getClient();
    const { error: uploadError } = (await storage.storage
      .from(bucket)
      .upload(savedFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })) as { error: { message: string } | null };
    if (uploadError) {
      throw new Error('Lỗi khi tải tệp lên Supabase: ' + uploadError.message);
    }
    const { data: publicUrlData } = this.storageService
      .getClient()
      .storage.from(bucket)
      .getPublicUrl(savedFilename);
    const filePath = publicUrlData?.publicUrl || '';

    const status = await this.documentStatusRepository.findOne({
      where: { name: 'uploaded' },
    });

    if (!status) {
      throw new NotFoundException(
        'Không tìm thấy trạng thái tài liệu mặc định',
      );
    }

    const document = this.documentRepository.create({
      user,
      filename,
      fileHash: originalFileHash || encryptedFileHash,
      encryptedFileHash,
      encryptedFilePath: filePath,
      encryptionKeyHash: encryptedFileHash,
      status,
    });

    const savedDocument = await this.documentRepository.save(document);

    return {
      documentId: savedDocument.id,
    };
  }

  async findAll(
    { id, role }: { id: string; role: string },
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

    if (role === 'staff') {
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
