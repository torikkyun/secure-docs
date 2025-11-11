import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>
  ) {
    this.userRepository = userRepository;
  }

  async getMe(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ["role", "status"],
    });
  }
}
