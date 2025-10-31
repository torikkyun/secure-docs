import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    const roles = ['staff', 'admin', 'auditor'];
    const existingRoles = await this.userRoleRepository.find({
      where: { name: In(roles) },
    });
    const existingNames = new Set(existingRoles.map((r) => r.name));
    const missing = roles.filter((r) => !existingNames.has(r));
    if (missing.length === 0) return;
    await this.userRoleRepository.save(missing.map((name) => ({ name })));
  }
}
