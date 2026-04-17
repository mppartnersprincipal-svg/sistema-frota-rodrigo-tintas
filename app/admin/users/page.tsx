export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import CreateDriverForm from "./CreateDriverForm";
import DriverRow from "./DriverRow";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  const [drivers, vehicles] = await Promise.all([
    prisma.user.findMany({
      where: { role: "DRIVER" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { trips: true } } },
    }),
    prisma.vehicle.findMany({
      where: { isActive: true },
      select: { id: true, model: true, plate: true },
      orderBy: { model: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              ← Painel
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">Motoristas</h1>
          </div>
          <span className="text-sm text-gray-500">{drivers.length} cadastrados</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Formulário de cadastro */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Novo Motorista
          </h2>
          <CreateDriverForm />
        </section>

        {/* Listagem */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Motoristas Cadastrados
          </h2>

          {drivers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
              Nenhum motorista cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => (
                <DriverRow key={driver.id} driver={driver} vehicles={vehicles} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
