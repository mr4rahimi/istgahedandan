/**
 * Create or reset an admin user
 * Usage: npx tsx scripts/create-admin.ts <email> <password> <name>
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { password: hash, name: name || "ادمین" },
    create: { email, password: hash, name: name || "ادمین" },
  });
  console.log(`✓ Admin user ready: ${user.email} (id=${user.id})`);
}

main().finally(() => prisma.$disconnect());
