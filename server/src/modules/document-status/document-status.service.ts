import { Injectable } from '@nestjs/common';
import { DocumentStatus } from './entities/document-status.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DocumentStatusService {
  constructor(
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepo: Repository<DocumentStatus>,
  ) {}

  async onModuleInit() {
    const statuses = ['uploaded', 'shared', 'archived'];
    const existingStatuses = await this.documentStatusRepo.find({
      where: { name: In(statuses) },
    });
    const existingNames = new Set(existingStatuses.map((r) => r.name));
    const missing = statuses.filter((r) => !existingNames.has(r));
    if (missing.length === 0) return;
    await this.documentStatusRepo.save(missing.map((name) => ({ name })));
  }
}
