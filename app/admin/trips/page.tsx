export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const tripsHoje = trips.filter((t) => t.start_time >= hoje);
  const kmHoje = tripsHoje.reduce((acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0), 0);
  const emRota = trips.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <main className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Relatório de Rotas</h1>
        <p className="text-xs text-gray-500 mt-0.5">{trips.length} rota(s) no total</p>
      </div>

      {/* Cards do dia */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Hoje</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{tripsHoje.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">KM hoje</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{kmHoje.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Em rota</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{emRota}</p>
        </div>
      </div>

      <TripsClient trips={serialized} drivers={drivers} vehicles={vehicles} />
    </main>
  );
}
