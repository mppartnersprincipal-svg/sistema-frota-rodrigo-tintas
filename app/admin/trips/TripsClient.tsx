"use client";

import { useState, useMemo } from "react";

type Trip = {
  id: string;
  start_km: number;
  end_km: number | null;
  start_time: string;
  end_time: string | null;
  orders: string;
  status: string;
  user: { name: string };
  vehicle: { model: string; plate: string };
};

type Driver = { id: string; name: string };

function fmt(dateStr: string | null, part: "date" | "time") {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (part === "date")
    return d.toLocaleDateString("pt-BR");
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function TripsClient({
  trips,
  drivers,
}: {
  trips: Trip[];
  drivers: Driver[];
}) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [driverId, setDriverId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const start = new Date(t.start_time);
      if (dateFrom && start < new Date(dateFrom + "T00:00:00")) return false;
      if (dateTo && start > new Date(dateTo + "T23:59:59")) return false;
      if (driverId && t.user.name !== drivers.find((d) => d.id === driverId)?.name) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [trips, dateFrom, dateTo, driverId, statusFilter, drivers]);

  function exportCSV() {
    const header = [
      "Data",
      "Veículo",
      "Placa",
      "Motorista",
      "KM Saída",
      "KM Chegada",
      "Distância (km)",
      "Hora Saída",
      "Hora Chegada",
      "Pedidos Entregues",
      "Status",
    ];
    const rows = filtered.map((t) => [
      fmt(t.start_time, "date"),
      t.vehicle.model,
      t.vehicle.plate,
      t.user.name,
      t.start_km,
      t.end_km ?? "",
      t.end_km ? t.end_km - t.start_km : "",
      fmt(t.start_time, "time"),
      fmt(t.end_time, "time"),
      `"${t.orders}"`,
      t.status === "COMPLETED" ? "Concluída" : "Em andamento",
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rotas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-600">Filtrar rotas</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Motorista</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Todos</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="COMPLETED">Concluída</option>
              <option value="IN_PROGRESS">Em andamento</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{filtered.length}</span> rota(s) encontrada(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setDriverId(""); setStatusFilter(""); }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Limpar filtros
            </button>
            <button
              onClick={exportCSV}
              className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-800"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
          Nenhuma rota encontrada com os filtros aplicados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Veículo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Motorista</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">KM Saída</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">KM Chegada</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Distância</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Hr. Saída</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Hr. Chegada</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Pedidos Entregues</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => {
                const dist = t.end_km ? t.end_km - t.start_km : null;
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{fmt(t.start_time, "date")}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{t.vehicle.model}</span>
                      <span className="ml-1 text-xs text-gray-400">{t.vehicle.plate}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{t.user.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">{t.start_km.toLocaleString("pt-BR")}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">{t.end_km ? t.end_km.toLocaleString("pt-BR") : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-700">
                      {dist !== null ? `${dist.toLocaleString("pt-BR")} km` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">{fmt(t.start_time, "time")}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">{fmt(t.end_time, "time")}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate" title={t.orders}>{t.orders}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      {t.status === "COMPLETED" ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          Concluída
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                          Em andamento
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
