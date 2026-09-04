import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: "admin@unyxsolutions.com" },
    update: {},
    create: {
      email: "admin@unyxsolutions.com",
      passwordHash: adminHash,
      name: "Administrador UNYX",
      role: "ADMIN",
    },
  });

  const demoHash = await bcrypt.hash("Demo123!", 10);
  await prisma.user.upsert({
    where: { email: "demo@unyxsolutions.com" },
    update: {},
    create: {
      email: "demo@unyxsolutions.com",
      passwordHash: demoHash,
      name: "Usuario Demo",
      role: "COMERCIAL",
    },
  });

  await prisma.sequence.upsert({
    where: { key: "proforma" },
    update: {},
    create: { key: "proforma", value: 0 },
  });

  await prisma.sequence.upsert({
    where: { key: "mantenimiento" },
    update: {},
    create: { key: "mantenimiento", value: 0 },
  });

  console.log("Seed completado: usuarios admin/demo y secuencias 'proforma' y 'mantenimiento' creados.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
