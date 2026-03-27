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

  // Veículos
  await prisma.vehicle.upsert({
    where: { plate: "ABC-1234" },
    update: {},
    create: {
      plate: "ABC-1234",
      model: "Fiat Fiorino",
      current_km: 45200,
      isActive: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { plate: "DEF-5678" },
    update: {},
    create: {
      plate: "DEF-5678",
      model: "VW Saveiro",
      current_km: 87350,
      isActive: true,
    },
  });

  console.log("✅ Seed concluído!");
  console.log("👤 Admin:       CPF 000.000.000-00 / PIN 0000 — Rodrigo Admin");
  console.log("🚗 Motorista 1: CPF 111.111.111-11 / PIN 1234 — Carlos Silva");
  console.log("🚗 Motorista 2: CPF 222.222.222-22 / PIN 5678 — João Pereira");
  console.log("🚐 Veículo 1:   ABC-1234 — Fiat Fiorino  (45.200 km)");
  console.log("🚐 Veículo 2:   DEF-5678 — VW Saveiro    (87.350 km)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
