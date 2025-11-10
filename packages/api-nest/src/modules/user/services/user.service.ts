import { Role } from "@modules/role/entities/role.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { QueryUserDto } from "../dto/query-user.dto";
import { User } from "../entities/user.entity";

const SALT = 12;
const MAX_LIMIT = 100;

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly roleRepository: Repository<Role>;
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(Role)
    roleRepository: Repository<Role>
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async onModuleInit() {
    const existingUser = await this.userRepository.findOne({
      where: { email: "admin@gmail.com" },
    });

    const adminRole = await this.roleRepository.findOne({
      where: { name: "admin" },
    });

    if (!existingUser) {
      if (!adminRole) {
        throw new Error(
          "Role 'admin' không tồn tại. Vui lòng khởi tạo role trước khi tạo user admin."
        );
      }

      const adminUser = new User();
      adminUser.email = "admin@gmail.com";
      adminUser.password = bcrypt.hashSync("Thisisapassword123", SALT);
      adminUser.firstName = "Admin";
      adminUser.lastName = "User";
      adminUser.role = adminRole;
      await this.userRepository.save(adminUser);
    }
  }

  async findAll({ page, limit, search }: QueryUserDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(Math.max(1, Number(limit) || 10), MAX_LIMIT);
    const skip = (pageNum - 1) * take;

    const query = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .select(["user.id", "user.email", "role.name"])
      .orderBy("user.id", "DESC")
      .skip(skip)
      .take(take);

    if (search) {
      query.andWhere("(user.email ILIKE :search)", { search: `%${search}%` });
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page: pageNum, limit: take };
  }
}
