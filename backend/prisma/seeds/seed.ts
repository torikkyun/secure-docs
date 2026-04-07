import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@/prisma/client";
import "dotenv/config";
import { hashPassword } from "@/common/utils/hash.util";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
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
      const adminRole = await prisma.role.upsert({
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
      // const adminEmail = "admin@gmail.com";

      // const getDicebearAvatar = (seed: string) => {
      //   return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(seed)}&background=%23ffffff`;
      // };

      // await prisma.user.upsert({
      //   where: { email: adminEmail },
      //   update: {},
      //   create: {
      //     email: adminEmail,
      //     password: hashPassword("Thisisapassword123"),
      //     name: "Admin",
      //     roleId: adminRole.id,
      //     avatar: getDicebearAvatar(adminEmail),
      //   },
      // });

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
