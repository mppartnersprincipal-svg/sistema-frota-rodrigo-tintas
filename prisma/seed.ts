import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  await prisma.user.upsert({
    where: { cpf: "00000000000" },
    update: {},
    create: {
      name: "Rodrigo Admin",
      cpf: "00000000000",
      pin: "0000",
      role: "ADMIN",
    },
  });

  // Motoristas
  await prisma.user.upsert({
    where: { cpf: "11111111111" },
    update: {},
    create: {
      name: "Carlos Silva",
      cpf: "11111111111",
      pin: "1234",
      role: "DRIVER",
    },
  });

  await prisma.user.upsert({
    where: { cpf: "22222222222" },
    update: {},
    create: {
      name: "João Pereira",
      cpf: "22222222222",
      pin: "5678",
      role: "DRIVER",
    },
  });

  // Remove veículos legados (seed antigo)
  await prisma.vehicle.deleteMany({ where: { plate: { in: ["ABC-1234", "DEF-5678"] } } });

  // Veículos da frota real
  await prisma.vehicle.upsert({
    where: { plate: "RBT3D08" },
    update: {},
    create: { plate: "RBT3D08", model: "Saveiro", current_km: 0, isActive: true },
  });

  await prisma.vehicle.upsert({
    where: { plate: "PQW5544" },
    update: {},
    create: { plate: "PQW5544", model: "Volkswagen UP", current_km: 0, isActive: true },
  });

  await prisma.vehicle.upsert({
    where: { plate: "RCI2J62" },
    update: {},
    create: { plate: "RCI2J62", model: "Moto", current_km: 0, isActive: true },
  });

  await prisma.vehicle.upsert({
    where: { plate: "PRA4J55" },
    update: {},
    create: { plate: "PRA4J55", model: "Moto", current_km: 0, isActive: true },
  });

  console.log("✅ Seed concluído!");
  console.log("👤 Admin:       CPF 000.000.000-00 / PIN 0000 — Rodrigo Admin");
  console.log("🚗 Motorista 1: CPF 111.111.111-11 / PIN 1234 — Carlos Silva");
  console.log("🚗 Motorista 2: CPF 222.222.222-22 / PIN 5678 — João Pereira");
  console.log("🚐 Carro 01:    RBT3D08 — Saveiro");
  console.log("🚐 Carro 02:    PQW5544 — Volkswagen UP");
  console.log("🛵 Moto 01:     RCI2J62 — Moto");
  console.log("🛵 Moto 02:     PRA4J55 — Moto");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
