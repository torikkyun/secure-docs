import { UserRole } from "@modules/user-role/entities/user-role.entity";
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
  private readonly userRoleRepository: Repository<UserRole>;
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
  }

  async onModuleInit() {
    const email = "admin@gmail.com";
    const fullName = "Admin User";

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    const adminRole = await this.userRoleRepository.findOne({
      where: { name: "admin" },
    });

    if (!adminRole) {
      throw new Error(
        "Role 'admin' không tồn tại. Vui lòng khởi tạo role trước khi khởi động ứng dụng."
      );
    }

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Thisisapassword123", SALT);
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.fullName = fullName;
      user.role = adminRole;
      await this.userRepository.save(user);
    }
  }

  async profile({ id }: User): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        publicKey: true,
      },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        publicKey: true,
      },
    });
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
      .select([
        "user.id",
        "user.email",
        "user.fullName",
        "user.publicKey",
        "role.name",
      ])
      .orderBy("user.id", "DESC")
      .skip(skip)
      .take(take);

    if (search) {
      query.andWhere(
        "(user.email ILIKE :search OR user.fullName ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page: pageNum, limit: take };
  }
}
