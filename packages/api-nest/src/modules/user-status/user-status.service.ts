import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserStatus } from "./entities/user-status.entity";

@Injectable()
export class UserStatusService {
  private readonly statusRepository: Repository<UserStatus>;
  constructor(
    @InjectRepository(UserStatus)
    statusRepository: Repository<UserStatus>
  ) {
    this.statusRepository = statusRepository;
  }

  async onModuleInit() {
    const statuses = [
      { name: "active", description: "Đang hoạt động" },
      { name: "pending", description: "Chờ xác thực" },
      { name: "disabled", description: "Bị vô hiệu hóa" },
    ];

    for (const status of statuses) {
      const found = await this.statusRepository.findOne({
        where: { name: status.name },
      });
      if (!found) {
        const newStatus = new UserStatus();
        newStatus.name = status.name;
        newStatus.description = status.description;
        await this.statusRepository.save(newStatus);
      }
    }
  }
}
