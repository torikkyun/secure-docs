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
        create: { name: "active", description: "File is active" },
      });
      await prisma.fileStatus.upsert({
        where: { name: "deleted" },
        update: {},
        create: { name: "deleted", description: "File is deleted" },
      });

      // Seed AccessGrantStatus
      await prisma.accessGrantStatus.upsert({
        where: { name: "active" },
        update: {},
        create: { name: "active", description: "Grant is active" },
      });
      await prisma.accessGrantStatus.upsert({
        where: { name: "revoked" },
        update: {},
        create: { name: "revoked", description: "Grant is revoked" },
      });
      await prisma.accessGrantStatus.upsert({
        where: { name: "expired" },
        update: {},
        create: { name: "expired", description: "Grant is expired" },
      });

      // Seed DownloadStatus
      await prisma.downloadStatus.upsert({
        where: { name: "success" },
        update: {},
        create: { name: "success", description: "Download successful" },
      });
      await prisma.downloadStatus.upsert({
        where: { name: "failed" },
        update: {},
        create: { name: "failed", description: "Download failed" },
      });

      // Seed ReceiptStatus
      await prisma.receiptStatus.upsert({
        where: { name: "confirmed" },
        update: {},
        create: { name: "confirmed", description: "Receipt confirmed" },
      });

      // Seed BlockchainSyncStatus
      await prisma.blockchainSyncStatus.upsert({
        where: { name: "confirmed" },
        update: {},
        create: { name: "confirmed", description: "Sync confirmed" },
      });

      // Seed IpfsPinStatus
      await prisma.ipfsPinStatus.upsert({
        where: { name: "pinned" },
        update: {},
        create: { name: "pinned", description: "File is pinned" },
      });
      await prisma.ipfsPinStatus.upsert({
        where: { name: "unpinned" },
        update: {},
        create: { name: "unpinned", description: "File is unpinned" },
      });

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
