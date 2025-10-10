import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Command({
  name: 'seed-database',
  description: 'Seed dữ liệu mặc định cho các bảng enum/reference',
})
@Injectable()
export class SeedDatabaseCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run(): Promise<void> {
    try {
      // Seed user_roles
      await this.prisma.userRole.createMany({
        data: [{ name: 'staff' }, { name: 'admin' }, { name: 'auditor' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed user_roles thành công');

      // Seed document_classifications
      await this.prisma.documentClassification.createMany({
        data: [
          { name: 'no_classification' },
          { name: 'internal' },
          { name: 'confidential' },
        ],
        skipDuplicates: true,
      });
      console.log('✅ Seed document_classifications thành công');

      // Seed document_statuses
      await this.prisma.documentStatus.createMany({
        data: [
          { name: 'pending' },
          { name: 'processed' },
          { name: 'needs_review' },
        ],
        skipDuplicates: true,
      });
      console.log('✅ Seed document_statuses thành công');

      // Seed share_statuses
      await this.prisma.shareStatus.createMany({
        data: [{ name: 'active' }, { name: 'revoked' }, { name: 'expired' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed share_statuses thành công');

      // Seed action_types
      await this.prisma.actionType.createMany({
        data: [
          { name: 'login' },
          { name: 'logout' },
          { name: 'upload' },
          { name: 'share' },
          { name: 'download' },
          { name: 'revoke_access' },
          { name: 'query_audit_log' },
          { name: 'export_report' },
          { name: 'view_document' },
          { name: 'blockchain_record' },
          { name: 'auth_login' },
          { name: 'auth_logout' },
          { name: 'user_create' },
          { name: 'user_update' },
        ],
        skipDuplicates: true,
      });
      console.log('✅ Seed action_types thành công');

      // Seed audit_statuses
      await this.prisma.auditStatus.createMany({
        data: [{ name: 'success' }, { name: 'failed' }, { name: 'revoked' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed audit_statuses thành công');

      // Seed user_statuses
      await this.prisma.userStatus.createMany({
        data: [{ name: 'active' }, { name: 'locked' }],
        skipDuplicates: true,
      });
      console.log('✅ Seed user_statuses thành công');

      await this.prisma.department.create({
        data: {
          code: 'CNTT',
          name: 'Công Nghệ Thông Tin',
          description: 'Phòng ban Công Nghệ Thông Tin',
        },
      });

      // Seed a default admin user
      const adminStaffId = '122001473';
      const adminPassword = 'thisisapassword123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          staffId: adminStaffId,
          passwordHash: hashedPassword,
          name: 'Quản trị viên CNTT',
          Role: { connect: { name: 'admin' } },
          Department: { connect: { code: 'CNTT' } },
          Status: { connect: { name: 'active' } },
        },
      });
      console.log(
        `✅ Tạo người dùng quản trị viên mặc định với staffId '${adminStaffId}' và mật khẩu '${adminPassword}'`,
      );

      console.log('🎉 Quá trình seed enums đã hoàn tất!');
    } catch (error) {
      console.error('❌ Lỗi khi seed enums:', error);
      process.exit(1);
    }
  }
}
