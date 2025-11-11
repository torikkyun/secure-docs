import { SupabaseService } from "@core/database/supabase.service";
import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupabaseClient } from "@supabase/supabase-js";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly userStatusRepository: Repository<UserStatus>;
  private readonly supabase: SupabaseClient;

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserStatus)
    userStatusRepository: Repository<UserStatus>,
    supabaseService: SupabaseService
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.userStatusRepository = userStatusRepository;
    this.supabase = supabaseService.getClient();
  }

  async onModuleInit() {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "Thisisapassword123";

    const { data } = await this.supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    const adminRole = await this.userRoleRepository.findOne({
      where: { name: "admin" },
    });

    const activeStatus = await this.userStatusRepository.findOne({
      where: { name: "active" },
    });

    if (!(adminRole && activeStatus)) {
      throw new Error("Admin role hoặc Active status không tồn tại.");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingUser) {
      const adminUser = new User();
      adminUser.id = data.user?.id || "";
      adminUser.email = adminEmail;
      adminUser.username = "admin";
      adminUser.role = adminRole;
      adminUser.status = activeStatus;
      adminUser.metadata = {};
      await this.userRepository.save(adminUser);
    }
  }

  async getMe(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ["role", "status"],
    });
  }
}
