import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, type Repository } from "typeorm";
import { DocumentStatus } from "./entities/document-status.entity";

@Injectable()
export class DocumentStatusService {
  private readonly documentStatusRepo: Repository<DocumentStatus>;

  constructor(
    @InjectRepository(DocumentStatus)
    documentStatusRepo: Repository<DocumentStatus>
  ) {
    this.documentStatusRepo = documentStatusRepo;
  }

  async onModuleInit() {
    const statuses = ["uploaded", "shared", "archived"];
    const existingStatuses = await this.documentStatusRepo.find({
      where: { name: In(statuses) },
    });
    const existingNames = new Set(existingStatuses.map((r) => r.name));
    const missing = statuses.filter((r) => !existingNames.has(r));
    if (missing.length === 0) {
      return;
    }
    await this.documentStatusRepo.save(missing.map((name) => ({ name })));
  }
}
