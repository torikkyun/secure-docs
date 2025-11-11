import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRole } from "./entities/user-role.entity";

@Injectable()
export class UserRoleService {
  private readonly roleRepository: Repository<UserRole>;
  constructor(
    @InjectRepository(UserRole)
    roleRepository: Repository<UserRole>
  ) {
    this.roleRepository = roleRepository;
  }

  async onModuleInit() {
    const roles = [
      { name: "admin", description: "Quản trị hệ thống" },
      {
        name: "recipient",
        description: "Người được cấp quyền truy cập file (theo chính sách)",
      },
      { name: "owner", description: "Người sở hữu file" },
    ];

    for (const roleData of roles) {
      const found = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });
      if (!found) {
        const role = new UserRole();
        role.name = roleData.name;
        role.description = roleData.description;
        await this.roleRepository.save(role);
      }
    }
  }
}
