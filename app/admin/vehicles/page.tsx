export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
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
    <main className="px-6 py-6 space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Veículos</h1>
        <p className="text-sm text-gray-500 mt-0.5">{ativos} ativo(s) · {vehicles.length} total</p>
      </div>

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
  );
}
