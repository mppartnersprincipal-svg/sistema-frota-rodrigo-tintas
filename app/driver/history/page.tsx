export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function DriverHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/admin");

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { start_time: "desc" },
    include: { vehicle: { select: { model: true, plate: true } } },
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <Link
          href="/driver"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Histórico de Rotas</h1>
          <p className="text-xs text-gray-500">{trips.length} rota(s) registrada(s)</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        {trips.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 text-5xl">📋</div>
            <p className="text-base font-semibold text-gray-700">Nenhuma rota registrada</p>
            <p className="mt-1 text-sm text-gray-400">
              Suas rotas aparecerão aqui após a primeira saída.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => {
              const distancia =
                trip.end_km != null ? trip.end_km - trip.start_km : null;

              const dataInicio = new Date(trip.start_time).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              });

              const horaFim =
                trip.end_time != null
                  ? new Date(trip.end_time).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Sao_Paulo",
                    })
                  : null;

              const emAndamento = trip.status === "IN_PROGRESS";
              const retornando = trip.status === "RETURNING";
              const cancelada = trip.status === "CANCELLED";

              return (
                <li
                  key={trip.id}
                  className={`rounded-2xl border-2 bg-white p-4 shadow-sm ${
                    emAndamento || retornando ? "border-orange-300" : "border-gray-100"
                  }`}
                >
                  {/* Cabeçalho do card */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {trip.vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500">{trip.vehicle.plate}</p>
                    </div>
                    {retornando ? (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                        Retornando
                      </span>
                    ) : emAndamento ? (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                        Em andamento
                      </span>
                    ) : cancelada ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                        Cancelada
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Concluída
                      </span>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <InfoItem label="Saída" value={dataInicio} />
                    <InfoItem label="Retorno" value={horaFim ?? "—"} />
                    <InfoItem
                      label="KM Inicial"
                      value={`${trip.start_km.toLocaleString("pt-BR")} km`}
                    />
                    <InfoItem
                      label="KM Final"
                      value={
                        trip.end_km != null
                          ? `${trip.end_km.toLocaleString("pt-BR")} km`
                          : "—"
                      }
                    />
                    {distancia != null && (
                      <div className="col-span-2">
                        <InfoItem
                          label="Distância percorrida"
                          value={`${distancia.toLocaleString("pt-BR")} km`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pedidos */}
                  {trip.orders && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Pedidos
                      </p>
                      <p className="text-sm text-gray-700">{trip.orders}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 font-medium text-gray-800">{value}</p>
    </div>
  );
}
