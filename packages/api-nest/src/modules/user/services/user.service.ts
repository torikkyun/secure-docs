import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly userStatusRepository: Repository<UserStatus>;
  private readonly configService: ConfigService;
  private readonly supabase: SupabaseClient;

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserStatus)
    userStatusRepository: Repository<UserStatus>,
    configService: ConfigService
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.userStatusRepository = userStatusRepository;
    this.configService = configService;

    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseServiceRoleKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY"
    );
    if (!(supabaseUrl && supabaseServiceRoleKey)) {
      throw new Error(
        "Supabase URL và Service Role Key không được cấu hình trong biến môi trường."
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async onModuleInit() {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "Thisisapassword123";

    const { error } = await this.supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (error && !error.message.includes("already registered")) {
      throw new Error(`Supabase Auth error: ${error.message}`);
    }

    const adminRole = await this.userRoleRepository.findOne({
      where: { name: "admin" },
    });
    if (!adminRole) {
      throw new Error("Role 'admin' không tồn tại.");
    }

    const activeStatus = await this.userStatusRepository.findOne({
      where: { name: "active" },
    });
    if (!activeStatus) {
      throw new Error("Status 'active' không tồn tại.");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingUser) {
      const adminUser = new User();
      adminUser.email = adminEmail;
      adminUser.username = "admin";
      adminUser.publicKey = "1234567890abcdef";
      adminUser.role = adminRole;
      adminUser.status = activeStatus;
      adminUser.metadata = {};
      await this.userRepository.save(adminUser);
    }
  }

  // async findAll({ page, limit, search }: QueryUserDto): Promise<{
  //   data: User[];
  //   total: number;
  //   page: number;
  //   limit: number;
  // }> {
  //   const pageNum = Math.max(1, Number(page) || 1);
  //   const take = Math.min(Math.max(1, Number(limit) || 10), MAX_LIMIT);
  //   const skip = (pageNum - 1) * take;

  //   const query = this.userRepository
  //     .createQueryBuilder("user")
  //     .leftJoinAndSelect("user.role", "role")
  //     .select(["user.id", "user.email", "role.name"])
  //     .orderBy("user.id", "DESC")
  //     .skip(skip)
  //     .take(take);

  //   if (search) {
  //     query.andWhere("(user.email ILIKE :search)", { search: `%${search}%` });
  //   }

  //   const [data, total] = await query.getManyAndCount();

  //   return { data, total, page: pageNum, limit: take };
  // }
}
