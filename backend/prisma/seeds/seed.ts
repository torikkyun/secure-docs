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
      const adminRole = await prisma.role.upsert({
        where: { name: "admin" },
        update: {},
        create: { name: "admin" },
      });
      await prisma.role.upsert({
        where: { name: "manager" },
        update: {},
        create: { name: "manager" },
      });
      await prisma.role.upsert({
        where: { name: "user" },
        update: {},
        create: { name: "user" },
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
