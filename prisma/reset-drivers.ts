import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const stops = await prisma.tripStop.deleteMany({});
  console.log(`✅ TripStops deletados: ${stops.count}`);

  const trips = await prisma.trip.deleteMany({});
  console.log(`✅ Trips deletados: ${trips.count}`);

  const drivers = await prisma.user.deleteMany({ where: { role: "DRIVER" } });
  console.log(`✅ Motoristas deletados: ${drivers.count}`);

  const remaining = await prisma.user.findMany();
  console.log("\n👤 Usuários restantes:");
  for (const u of remaining) {
    console.log(`  [${u.role}] ${u.name} | CPF: ${u.cpf}`);
  }
}

main().finally(() => prisma.$disconnect());
