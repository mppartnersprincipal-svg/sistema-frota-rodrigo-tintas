import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import CreateVehicleForm from "./CreateVehicleForm";
import VehicleRow from "./VehicleRow";

export default async function AdminVehiclesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { model: "asc" },
    include: { _count: { select: { trips: true } } },
  });

  const ativos = vehicles.filter((v) => v.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-blue-700 hover:underline">
              ← Painel
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">Veículos</h1>
          </div>
          <span className="text-sm text-gray-500">
            {ativos} ativo(s) · {vehicles.length} total
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Novo Veículo</h2>
          <CreateVehicleForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Veículos Cadastrados</h2>

          {vehicles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
              Nenhum veículo cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <VehicleRow key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
