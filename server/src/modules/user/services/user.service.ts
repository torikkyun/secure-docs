import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { QueryUserDto } from '../dto/query-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@modules/user-role/entities/user-role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    const email = 'admin@gmail.com';
    const fullName = 'Admin User';

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    const adminRole = await this.userRoleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Thisisapassword123', 12);
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.fullName = fullName;
      user.role = adminRole!;
      await this.userRepository.save(user);
    }
  }

  async findAll({ page, limit, search }: QueryUserDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (pageNum - 1) * take;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.publicKey',
        'role.name',
      ])
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(take);

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page: pageNum, limit: take };
  }
}
