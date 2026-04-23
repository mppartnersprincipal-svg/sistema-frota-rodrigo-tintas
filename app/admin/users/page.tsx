export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
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
    <main className="px-4 py-5 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Motoristas</h1>
        <p className="text-xs text-gray-500 mt-0.5">{drivers.length} cadastrado(s)</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-900">Novo Motorista</h2>
        <CreateDriverForm vehicles={vehicles} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-gray-900">Motoristas Cadastrados</h2>
        {drivers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
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
  );
}
