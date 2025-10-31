import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, type Repository } from "typeorm";
import { TargetType } from "./entities/target-type.entity";

@Injectable()
export class TargetTypeService {
  private readonly targetTypeRepo: Repository<TargetType>;

  constructor(
    @InjectRepository(TargetType)
    targetTypeRepo: Repository<TargetType>
  ) {
    this.targetTypeRepo = targetTypeRepo;
  }

  async onModuleInit() {
    const types = ["document", "share"];
    const existingTypes = await this.targetTypeRepo.find({
      where: { name: In(types) },
    });
    const existingNames = new Set(existingTypes.map((r) => r.name));
    const missing = types.filter((r) => !existingNames.has(r));
    if (missing.length === 0) {
      return;
    }
    await this.targetTypeRepo.save(missing.map((name) => ({ name })));
  }
}
