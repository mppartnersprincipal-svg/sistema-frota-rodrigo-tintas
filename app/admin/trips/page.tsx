export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import TripsClient from "./TripsClient";

export default async function AdminTripsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  const [trips, drivers, vehicles] = await Promise.all([
    prisma.trip.findMany({
      orderBy: { start_time: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        vehicle: { select: { id: true, model: true, plate: true } },
        stops: { select: { status: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "DRIVER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({
      select: { id: true, model: true, plate: true, current_km: true, isActive: true },
      orderBy: { model: "asc" },
    }),
  ]);

  const serialized = trips.map((t) => ({
    id: t.id,
    start_km: t.start_km,
    end_km: t.end_km,
    start_time: t.start_time.toISOString(),
    end_time: t.end_time?.toISOString() ?? null,
    orders: t.orders,
    status: t.status,
    totalSteps: t.totalSteps,
    completedStops: t.stops.filter((s) => s.status === "COMPLETED").length,
    user: t.user,
    vehicle: t.vehicle,
  }));

  // Cards de resumo (calculados server-side para o header)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const tripsHoje = trips.filter((t) => t.start_time >= hoje);
  const kmHoje = tripsHoje.reduce((acc, t) => {
    if (t.end_km) return acc + (t.end_km - t.start_km);
    return acc;
  }, 0);
  const emRota = trips.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-blue-700 hover:underline">
              ← Painel
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">Relatório de Rotas</h1>
          </div>
          <span className="text-sm text-gray-500">{trips.length} rota(s) no total</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Cards resumo do dia */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Rotas hoje</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{tripsHoje.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">KM rodado hoje</p>
            <p className="mt-1 text-3xl font-bold text-blue-700">{kmHoje.toLocaleString("pt-BR")} km</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Em rota agora</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">{emRota}</p>
          </div>
        </div>

        <TripsClient trips={serialized} drivers={drivers} vehicles={vehicles} />
      </main>
    </div>
  );
}
