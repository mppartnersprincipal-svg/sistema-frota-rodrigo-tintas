import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "dev.db") });
const p = new PrismaClient({ adapter });

async function main() {
  const v = await p.vehicle.findMany({ select: { id: true, model: true, plate: true, _count: { select: { trips: true } } } });
  console.log("VEHICLES:", JSON.stringify(v, null, 2));
  const u = await p.user.findMany({ select: { name: true, vehicleId: true, role: true } });
  console.log("USERS:", JSON.stringify(u, null, 2));
}

main().finally(() => p.$disconnect());
