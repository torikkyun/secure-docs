import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, type Repository } from "typeorm";
import { UserRole } from "./entities/user-role.entity";

@Injectable()
export class UserRoleService {
  private readonly userRoleRepository: Repository<UserRole>;
  constructor(
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>
  ) {
    this.userRoleRepository = userRoleRepository;
  }

  async onModuleInit() {
    const roles = ["staff", "admin", "auditor"];
    const existingRoles = await this.userRoleRepository.find({
      where: { name: In(roles) },
    });
    const existingNames = new Set(existingRoles.map((r) => r.name));
    const missing = roles.filter((r) => !existingNames.has(r));
    if (missing.length === 0) {
      return;
    }
    await this.userRoleRepository.save(missing.map((name) => ({ name })));
  }
}
