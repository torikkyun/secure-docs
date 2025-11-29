import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const {
    values: { environment },
  } = parseArgs({
    options: {
      environment: { type: "string" as const },
    },
  });

  switch (environment) {
    case "development": {
      // Seed roles
      await prisma.role.upsert({
        where: { name: "admin" },
        update: {},
        create: { name: "admin" },
      });
      await prisma.role.upsert({
        where: { name: "user" },
        update: {},
        create: { name: "user" },
      });

      // Seed users
      // await prisma.user.upsert({
      //   where: { email: "admin@example.com" },
      //   update: {},
      //   create: {
      //     email: "admin@gmail.com",
      //     password: await bcrypt.hash("Thisisapassword123", 10),
      //     name: "Admin",
      //     rolename: adminRole.name,
      //   },
      // });

      // Seed FileStatus
      await prisma.fileStatus.upsert({
        where: { name: "active" },
        update: {},
        create: { name: "active", description: "File đã được tạo" },
      });
      await prisma.fileStatus.upsert({
        where: { name: "deleted" },
        update: {},
        create: { name: "deleted", description: "File đã bị xóa" },
      });

      // Seed AccessGrantStatus
      await prisma.accessGrantStatus.upsert({
        where: { name: "active" },
        update: {},
        create: { name: "active", description: "Quyền truy cập đã được cấp" },
      });
      await prisma.accessGrantStatus.upsert({
        where: { name: "revoked" },
        update: {},
        create: {
          name: "revoked",
          description: "Quyền truy cập đã bị thu hồi",
        },
      });
      await prisma.accessGrantStatus.upsert({
        where: { name: "expired" },
        update: {},
        create: { name: "expired", description: "Quyền truy cập đã hết hạn" },
      });

      // Seed DownloadStatus
      await prisma.downloadStatus.upsert({
        where: { name: "pending" },
        update: {},
        create: { name: "pending", description: "Đang chờ xử lý" },
      });
      await prisma.downloadStatus.upsert({
        where: { name: "success" },
        update: {},
        create: { name: "success", description: "Download thành công" },
      });
      await prisma.downloadStatus.upsert({
        where: { name: "failed" },
        update: {},
        create: { name: "failed", description: "Download thất bại" },
      });

      // Seed IpfsPinStatus
      await prisma.ipfsPinStatus.upsert({
        where: { name: "pinned" },
        update: {},
        create: { name: "pinned", description: "Đã được pin" },
      });
      await prisma.ipfsPinStatus.upsert({
        where: { name: "unpinned" },
        update: {},
        create: { name: "unpinned", description: "Không còn được pin" },
      });

      // Seed EventType
      const eventTypes = [
        { name: "USER_REGISTER", description: "Người dùng đăng ký tài khoản" },
        { name: "USER_LOGIN", description: "Người dùng đăng nhập" },
        { name: "USER_LOGOUT", description: "Người dùng đăng xuất" },
        {
          name: "USER_UPDATE_PROFILE",
          description: "Người dùng cập nhật thông tin cá nhân",
        },
        { name: "FILE_UPLOAD", description: "Người dùng upload file" },
        { name: "FILE_SHARE", description: "Người dùng chia sẻ file" },
        {
          name: "FILE_REVOKE",
          description: "Người dùng thu hồi quyền truy cập",
        },
        { name: "FILE_DELETE", description: "Người dùng xóa file" },
        { name: "FILE_DOWNLOAD", description: "Người dùng tải file" },
      ];

      for (const eventType of eventTypes) {
        await prisma.eventType.upsert({
          where: { name: eventType.name },
          update: {},
          create: eventType,
        });
      }

      break;
    }
    case "test":
      // Seed data cho môi trường test nếu cần
      break;
    default:
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
