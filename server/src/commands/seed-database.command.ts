import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

@Command({
  name: 'seed-database',
  description: 'Seed dữ liệu mặc định cho các bảng enum',
})
@Injectable()
export class SeedDatabaseCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run(): Promise<void> {
    try {
      // Seed UserRole
      await this.prisma.userRole.deleteMany();
      await this.prisma.userRole.createMany({
        data: [{ name: 'admin' }, { name: 'user' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed UserRole thành công');

      // Seed UserStatus
      await this.prisma.userStatus.deleteMany();
      await this.prisma.userStatus.createMany({
        data: [{ name: 'active' }, { name: 'locked' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed UserStatus thành công');

      // Seed EventStatus
      await this.prisma.eventStatus.deleteMany();
      await this.prisma.eventStatus.createMany({
        data: [{ name: 'active' }, { name: 'revoked' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed EventStatus thành công');

      // Seed LedgerType
      await this.prisma.ledgerType.deleteMany();
      await this.prisma.ledgerType.createMany({
        data: [{ name: 'sepolia_testnet' }, { name: 'amoy_testnet' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed LedgerType thành công');

      console.log('🎉 Quá trình seed enums đã hoàn tất!');
    } catch (error) {
      console.error('❌ Lỗi khi seed enums:', error);
      process.exit(1);
    }
  }
}
