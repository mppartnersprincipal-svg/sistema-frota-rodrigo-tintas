import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import StopControls from "./StopControls";
import CancelTripButton from "./CancelTripButton";

export default async function ActiveTripPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/admin");

  const activeTrip = await prisma.trip.findFirst({
    where: { userId: user.id, status: "IN_PROGRESS" },
    include: {
      vehicle: true,
      stops: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!activeTrip) redirect("/driver");

  const startTime = new Date(activeTrip.start_time).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasActiveStop = activeTrip.stops.some((s) => s.status === "IN_PROGRESS");
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <Link
          href="/driver"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Rota em Andamento</h1>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 space-y-5">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Em andamento
          </span>
        </div>

        {/* Progresso das paradas */}
        {activeTrip.totalSteps > 1 && (
          <div className="rounded-2xl border-2 border-orange-100 bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-2">
              Progresso das Entregas
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: activeTrip.totalSteps }, (_, i) => {
                const stepN = i + 1;
                const stop = activeTrip.stops.find((s) => s.stepNumber === stepN);
                const isCompleted = stop?.status === "COMPLETED";
                const isActive = stop?.status === "IN_PROGRESS";
                const isPending = !stop;
                return (
                  <div
                    key={stepN}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isActive ? "bg-orange-500 text-white animate-pulse" : ""}
                      ${isPending ? "bg-gray-200 text-gray-500" : ""}
                    `}
                  >
                    {fmt(stepN)}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-sm font-medium text-orange-800">
              {activeTrip.currentStep === 0
                ? "Nenhuma entrega iniciada"
                : hasActiveStop
                ? `Entrega ${fmt(activeTrip.currentStep)} em andamento`
                : `${activeTrip.stops.filter((s) => s.status === "COMPLETED").length} de ${activeTrip.totalSteps} concluídas`}
            </p>
          </div>
        )}

        {/* Detalhes da rota */}
        <div className="space-y-4 rounded-2xl border-2 border-gray-100 bg-gray-50 p-5 shadow-sm">
          <InfoRow label="Veículo" value={activeTrip.vehicle.model} />
          <InfoRow label="Placa" value={activeTrip.vehicle.plate} />
          <InfoRow
            label="KM de Saída"
            value={`${activeTrip.start_km.toLocaleString("pt-BR")} km`}
          />
          <InfoRow label="Hora de Saída" value={startTime} />
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pedidos
            </p>
            <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-base font-medium text-gray-800 shadow-sm">
              {activeTrip.orders}
            </p>
          </div>
        </div>
      </main>

      <StopControls
        tripId={activeTrip.id}
        totalSteps={activeTrip.totalSteps}
        currentStep={activeTrip.currentStep}
        hasActiveStop={hasActiveStop}
        startKm={activeTrip.start_km}
      />

      {/* Cancelar rota — fixado acima do StopControls */}
      <CancelTripButton tripId={activeTrip.id} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
