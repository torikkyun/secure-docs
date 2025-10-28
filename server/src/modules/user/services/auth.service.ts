import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@modules/user-role/entities/user-role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private defaultUserRole: UserRole;
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    const foundRole = await this.userRoleRepository.findOne({
      where: { name: 'staff' },
    });
    if (!foundRole) {
      throw new Error(
        "Role 'staff' không tồn tại. Vui lòng khởi tạo role trước khi đăng ký người dùng.",
      );
    }
    this.defaultUserRole = foundRole;
  }

  async register({ email, password, ...rest }: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.role = this.defaultUserRole;
    Object.assign(user, rest);
    await this.userRepository.save(user);

    return {
      message: 'Đăng ký thành công',
      user: { id: user.id, email: user.email },
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      throw new ConflictException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Email hoặc mật khẩu không đúng');
    }

    const token = this.jwtService.sign({ id: user.id, role: user.role.name });

    return {
      message: 'Đăng nhập thành công',
      user: { id: user.id, email: user.email },
      token,
    };
  }
}
