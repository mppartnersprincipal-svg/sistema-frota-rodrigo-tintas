import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { trips: true } } },
  });

  for (const u of users) {
    const cpfFormatted = u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    console.log(`[${u.role}] ${u.name} | CPF: ${cpfFormatted} | PIN: ${u.pin} | Viagens: ${u._count.trips} | Criado: ${u.createdAt.toLocaleDateString("pt-BR")}`);
  }
}

main().finally(() => prisma.$disconnect());
