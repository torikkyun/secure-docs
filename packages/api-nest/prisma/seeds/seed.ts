import { parseArgs } from "node:util";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "generated/prisma/client";

const prisma = new PrismaClient();

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
      await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
          email: "admin@gmail.com",
          password: await bcrypt.hash("Thisisapassword123", 10),
          name: "Admin",
          roleId: adminRole.id,
        },
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
