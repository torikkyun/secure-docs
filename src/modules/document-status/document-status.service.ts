import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, type Repository } from "typeorm";
import { DocumentStatus } from "./entities/document-status.entity";

@Injectable()
export class DocumentStatusService {
  private readonly documentStatusRepository: Repository<DocumentStatus>;

  constructor(
    @InjectRepository(DocumentStatus)
    documentStatusRepository: Repository<DocumentStatus>
  ) {
    this.documentStatusRepository = documentStatusRepository;
  }

  async onModuleInit() {
    const statuses = ["uploaded", "shared", "archived"];
    const existingStatuses = await this.documentStatusRepository.find({
      where: { name: In(statuses) },
    });
    const existingNames = new Set(existingStatuses.map((r) => r.name));
    const missing = statuses.filter((r) => !existingNames.has(r));
    if (missing.length === 0) {
      return;
    }
    await this.documentStatusRepository.save(missing.map((name) => ({ name })));
  }

  findAll(): Promise<DocumentStatus[]> {
    return this.documentStatusRepository.find();
  }
}
