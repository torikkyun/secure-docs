import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { TargetType } from './entities/target-type.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TargetTypeService {
  constructor(
    @InjectRepository(TargetType)
    private readonly targetTypeRepo: Repository<TargetType>,
  ) {}

  async onModuleInit() {
    const types = ['document', 'share'];
    const existingTypes = await this.targetTypeRepo.find({
      where: { name: In(types) },
    });
    const existingNames = new Set(existingTypes.map((r) => r.name));
    const missing = types.filter((r) => !existingNames.has(r));
    if (missing.length === 0) return;
    await this.targetTypeRepo.save(missing.map((name) => ({ name })));
  }
}
