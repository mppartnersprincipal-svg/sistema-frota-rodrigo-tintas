/**
 * Remove usuários e veículos de teste (seed).
 * Execute com: npx tsx prisma/cleanup-test-data.ts
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "dev.db") });
const prisma = new PrismaClient({ adapter });

async function main() {
  // CPFs dos usuários de seed (teste)
  const testCpfs = ["11111111111", "22222222222"];

  const testUsers = await prisma.user.findMany({
    where: { cpf: { in: testCpfs } },
    select: { id: true, name: true },
  });

  if (testUsers.length === 0) {
    console.log("Nenhum usuário de teste encontrado.");
  } else {
    const testUserIds = testUsers.map((u) => u.id);

    // Deleta viagens dos usuários de teste
    const tripsDeleted = await prisma.trip.deleteMany({
      where: { userId: { in: testUserIds } },
    });
    console.log(`🗑  ${tripsDeleted.count} viagem(ns) de teste removida(s).`);

    // Deleta os usuários de teste
    await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
    console.log(`🗑  ${testUsers.length} usuário(s) de teste removido(s): ${testUsers.map((u) => u.name).join(", ")}`);
  }

  // Agora deleta veículos sem viagens e sem vínculo com usuário
  const usersWithVehicle = await prisma.user.findMany({
    where: { vehicleId: { not: null } },
    select: { vehicleId: true },
  });
  const linkedIds = usersWithVehicle.map((u) => u.vehicleId as string);

  const vehiclesDeleted = await prisma.vehicle.deleteMany({
    where: {
      id: { notIn: linkedIds },
      trips: { none: {} },
    },
  });
  console.log(`🗑  ${vehiclesDeleted.count} veículo(s) sem vínculo removido(s).`);

  console.log("✅ Limpeza concluída.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
