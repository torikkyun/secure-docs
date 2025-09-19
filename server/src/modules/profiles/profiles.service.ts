import { PrismaService } from '@core/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCurrentUser({ id }: { id: string }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: id },
      include: { user: true },
    });

    if (!profile) {
      throw new BadRequestException('Người dùng chưa có hồ sơ cá nhân');
    }

    const { userId: _userId, user, ...profileRest } = profile;
    const { password: _password, ...userRest } = user;

    return {
      message: 'Lấy thông tin cá nhân thành công',
      profile: {
        ...profileRest,
        user: userRest,
      },
    };
  }
}
