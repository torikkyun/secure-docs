import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoginGoogleUserDto } from "../dto/login-google-user.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly userStatusRepository: Repository<UserStatus>;
  private readonly jwtService: JwtService;
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserRole)
    userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserStatus)
    userStatusRepository: Repository<UserStatus>,
    jwtService: JwtService
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.userStatusRepository = userStatusRepository;
    this.jwtService = jwtService;
  }
  async loginGoogle({ email, username }: LoginGoogleUserDto) {
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ["role", "status"],
    });
    if (!user) {
      const role = await this.userRoleRepository.findOne({
        where: { name: "owner" },
      });
      const status = await this.userStatusRepository.findOne({
        where: { name: "active" },
      });
      if (!(role && status)) {
        throw new Error("'Owner' role hoặc 'Active' status không tồn tại.");
      }
      user = new User();
      user.email = email;
      user.username = username;
      user.role = role;
      user.status = status;
      user.metadata = {};
      await this.userRepository.save(user);
    }
    const accessToken = this.jwtService.sign({
      id: user.id,
      role: { name: user.role.name },
    });
    return {
      message: "Đăng nhập Google thành công",
      accessToken,
    };
  }
}
