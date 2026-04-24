export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function DriverHomePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/admin");

  const activeTrip = await prisma.trip.findFirst({
    where: { userId: user.id, status: { in: ["IN_PROGRESS", "RETURNING"] } },
    include: { vehicle: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Motorista
          </p>
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        </div>
        <LogoutButton />
      </header>

      {/* Conteúdo central */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-32">
        {activeTrip ? (
          <div className="w-full max-w-sm rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 text-center shadow">
            <div className="mb-3 text-4xl">🚗</div>
            <p className="text-lg font-bold text-orange-700">Rota em andamento</p>
            <p className="mt-1 text-sm text-orange-600">
              {activeTrip.vehicle.model} — {activeTrip.vehicle.plate}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Saída:{" "}
              {new Date(activeTrip.start_time).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-6xl">📦</div>
            <p className="text-lg font-semibold text-gray-700">
              Nenhuma rota em andamento
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Toque no botão abaixo para iniciar uma nova saída.
            </p>
          </div>
        )}
      </main>

      {/* Botão fixo no rodapé — PRD §2: w-full, mín 48px, alto contraste */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-2">
          {activeTrip ? (
            <Link
              href="/driver/active-trip"
              className="flex w-full items-center justify-center rounded-xl bg-orange-500 py-4 text-lg font-bold text-white shadow-md active:scale-95"
              style={{ minHeight: "56px" }}
            >
              VER ROTA ATIVA
            </Link>
          ) : (
            <Link
              href="/driver/start-trip"
              className="flex w-full items-center justify-center rounded-xl bg-blue-700 py-4 text-lg font-bold text-white shadow-md active:scale-95"
              style={{ minHeight: "56px" }}
            >
              NOVA SAÍDA
            </Link>
          )}
          <Link
            href="/driver/history"
            className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 active:scale-95"
            style={{ minHeight: "48px" }}
          >
            VER HISTÓRICO DE ROTAS
          </Link>
        </div>
      </div>
    </div>
  );
}
