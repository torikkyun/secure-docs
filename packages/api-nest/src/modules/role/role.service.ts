import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";

@Injectable()
export class RoleService {
  private readonly roleRepository: Repository<Role>;

  constructor(
    @InjectRepository(Role)
    roleRepository: Repository<Role>
  ) {
    this.roleRepository = roleRepository;
  }

  async onModuleInit() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: "admin" },
    });

    if (!adminRole) {
      const role = new Role();
      role.name = "admin";
      role.description = "Quản trị viên với toàn quyền hạn";
      await this.roleRepository.save(role);
    }

    const userRole = await this.roleRepository.findOne({
      where: { name: "user" },
    });

    if (!userRole) {
      const role = new Role();
      role.name = "user";
      role.description = "Người dùng bình thường với quyền hạn hạn chế";
      await this.roleRepository.save(role);
    }
  }
}
