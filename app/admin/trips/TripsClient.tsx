"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Trip = {
  id: string;
  start_km: number;
  end_km: number | null;
  start_time: string;
  end_time: string | null;
  orders: string;
  status: string;
  totalSteps: number;
  completedStops: number;
  user: { id: string; name: string };
  vehicle: { id: string; model: string; plate: string };
};

type Driver = { id: string; name: string };

type Vehicle = {
  id: string;
  model: string;
  plate: string;
  current_km: number;
  isActive: boolean;
};

type Tab = "rotas" | "motoristas" | "veiculos";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function fmtTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

function fmtKm(n: number) {
  return n.toLocaleString("pt-BR");
}

function downloadCSV(filename: string, header: string[], rows: (string | number)[][]) {
  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TripsClient({
  trips,
  drivers,
  vehicles,
}: {
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  // Aba ativa
  const [activeTab, setActiveTab] = useState<Tab>("rotas");

  // Filtro de período — global, aplica-se a todas as abas
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filtros exclusivos da aba Rotas
  const [driverId, setDriverId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Trips filtradas pelo período (base para todas as abas)
  const tripsByPeriod = useMemo(() => {
    return trips.filter((t) => {
      const start = new Date(t.start_time);
      if (dateFrom && start < new Date(dateFrom + "T00:00:00")) return false;
      if (dateTo && start > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [trips, dateFrom, dateTo]);

  // ── Aba Rotas: filtros adicionais ─────────────────────────────────────────

  const filteredTrips = useMemo(() => {
    return tripsByPeriod.filter((t) => {
      if (driverId && t.user.id !== driverId) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [tripsByPeriod, driverId, statusFilter]);

  // ── Aba Motoristas: agregação ─────────────────────────────────────────────

  const driverStats = useMemo(() => {
    return drivers.map((d) => {
      const dTrips = tripsByPeriod.filter((t) => t.user.id === d.id);
      const completedTrips = dTrips.filter((t) => t.status === "COMPLETED");
      const totalKm = completedTrips.reduce(
        (acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0),
        0
      );
      const totalDeliveries = dTrips.reduce((acc, t) => acc + t.completedStops, 0);
      const lastTrip = dTrips[0]?.start_time ?? null; // já ordenado desc
      const activeNow = dTrips.some((t) => t.status === "IN_PROGRESS");
      return {
        id: d.id,
        name: d.name,
        totalTrips: dTrips.length,
        completedTrips: completedTrips.length,
        totalKm,
        totalDeliveries,
        lastTripDate: lastTrip,
        activeNow,
      };
    });
  }, [drivers, tripsByPeriod]);

  // ── Aba Veículos: agregação ───────────────────────────────────────────────

  const vehicleStats = useMemo(() => {
    return vehicles.map((v) => {
      const vTrips = tripsByPeriod.filter((t) => t.vehicle.id === v.id);
      const completedTrips = vTrips.filter((t) => t.status === "COMPLETED");
      const totalKm = completedTrips.reduce(
        (acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0),
        0
      );
      const totalDeliveries = vTrips.reduce((acc, t) => acc + t.completedStops, 0);
      const lastTrip = vTrips[0]?.start_time ?? null;
      const activeNow = vTrips.some((t) => t.status === "IN_PROGRESS");
      return {
        id: v.id,
        model: v.model,
        plate: v.plate,
        isActive: v.isActive,
        current_km: v.current_km,
        totalTrips: vTrips.length,
        completedTrips: completedTrips.length,
        totalKm,
        totalDeliveries,
        lastTripDate: lastTrip,
        activeNow,
      };
    });
  }, [vehicles, tripsByPeriod]);

  // ── CSV exports ───────────────────────────────────────────────────────────

  function exportRotasCSV() {
    const header = [
      "Data", "Veículo", "Placa", "Motorista",
      "KM Saída", "KM Chegada", "Distância (km)",
      "Hr. Saída", "Hr. Chegada",
      "Pedidos Entregues", "Entregas Concluídas", "Total de Entregas", "Status",
    ];
    const rows = filteredTrips.map((t) => [
      fmtDate(t.start_time),
      t.vehicle.model,
      t.vehicle.plate,
      t.user.name,
      t.start_km,
      t.end_km ?? "",
      t.end_km ? t.end_km - t.start_km : "",
      fmtTime(t.start_time),
      fmtTime(t.end_time),
      `"${t.orders}"`,
      t.completedStops,
      t.totalSteps,
      t.status === "COMPLETED" ? "Concluída" : "Em andamento",
    ]);
    downloadCSV("rotas", header, rows);
  }

  function exportMotoristasCSV() {
    const header = [
      "Motorista", "Rotas no Período", "Rotas Concluídas",
      "KM Rodado", "Entregas Realizadas", "Última Rota", "Status",
    ];
    const rows = driverStats.map((d) => [
      d.name,
      d.totalTrips,
      d.completedTrips,
      d.totalKm,
      d.totalDeliveries,
      d.lastTripDate ? fmtDate(d.lastTripDate) : "—",
      d.activeNow ? "Em rota" : "Disponível",
    ]);
    downloadCSV("motoristas", header, rows);
  }

  function exportVeiculosCSV() {
    const header = [
      "Veículo", "Placa", "KM Atual", "Rotas no Período", "Rotas Concluídas",
      "KM Rodado", "Entregas Realizadas", "Última Rota", "Status",
    ];
    const rows = vehicleStats.map((v) => [
      v.model,
      v.plate,
      v.current_km,
      v.totalTrips,
      v.completedTrips,
      v.totalKm,
      v.totalDeliveries,
      v.lastTripDate ? fmtDate(v.lastTripDate) : "—",
      !v.isActive ? "Inativo" : v.activeNow ? "Em rota" : "Disponível",
    ]);
    downloadCSV("veiculos", header, rows);
  }

  // ── Resumos por aba ───────────────────────────────────────────────────────

  const totalKmPeriodo = tripsByPeriod.reduce(
    (acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0), 0
  );
  const totalEntregasPeriodo = tripsByPeriod.reduce((acc, t) => acc + t.completedStops, 0);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const tabClass = (tab: Tab) =>
    activeTab === tab
      ? "border-b-2 border-blue-700 text-blue-700 font-bold pb-2 px-1"
      : "text-gray-500 hover:text-gray-700 pb-2 px-1 cursor-pointer";

  return (
    <div className="space-y-4">
      {/* Filtro de período — global */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-600">Período</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Limpar período
            </button>
          )}
          <span className="ml-auto text-sm text-gray-400">
            {tripsByPeriod.length} rota(s) no período
          </span>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-4">
        <nav className="flex gap-6 text-sm">
          <button className={tabClass("rotas")} onClick={() => setActiveTab("rotas")}>
            Rotas
          </button>
          <button className={tabClass("motoristas")} onClick={() => setActiveTab("motoristas")}>
            Por Motorista
          </button>
          <button className={tabClass("veiculos")} onClick={() => setActiveTab("veiculos")}>
            Por Veículo
          </button>
        </nav>
      </div>

      {/* ── ABA: ROTAS ───────────────────────────────────────────────────── */}
      {activeTab === "rotas" && (
        <div className="space-y-4">
          {/* Filtros adicionais */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-600">Filtrar</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
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
                <span className="font-bold text-gray-900">{filteredTrips.length}</span> rota(s) encontrada(s)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDriverId(""); setStatusFilter(""); }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Limpar filtros
                </button>
                <button
                  onClick={exportRotasCSV}
                  className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-800"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {filteredTrips.length === 0 ? (
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
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Entregas</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Pedidos</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTrips.map((t) => {
                    const dist = t.end_km ? t.end_km - t.start_km : null;
                    const allDone = t.completedStops === t.totalSteps && t.status === "COMPLETED";
                    return (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">{fmtDate(t.start_time)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{t.vehicle.model}</span>
                          <span className="ml-1 text-xs text-gray-400">{t.vehicle.plate}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{t.user.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">{fmtKm(t.start_km)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {t.end_km ? fmtKm(t.end_km) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-700">
                          {dist !== null ? `${fmtKm(dist)} km` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">{fmtTime(t.start_time)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">{fmtTime(t.end_time)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                              allDone
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {t.completedStops}/{t.totalSteps}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate" title={t.orders}>
                          {t.orders}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          {t.status === "COMPLETED" ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                              Concluída
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
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
      )}

      {/* ── ABA: POR MOTORISTA ───────────────────────────────────────────── */}
      {activeTab === "motoristas" && (
        <div className="space-y-4">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="Motoristas" value={drivers.length} />
            <SummaryCard label="Rotas no período" value={tripsByPeriod.length} />
            <SummaryCard
              label="KM no período"
              value={`${fmtKm(totalKmPeriodo)} km`}
              color="blue"
            />
            <SummaryCard
              label="Entregas realizadas"
              value={totalEntregasPeriodo}
              color="green"
            />
          </div>

          {/* Tabela + export */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Desempenho por motorista</p>
              <button
                onClick={exportMotoristasCSV}
                className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-800"
              >
                Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Motorista</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Rotas</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Concluídas</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">KM Rodado</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Entregas</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Última Rota</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {driverStats.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.totalTrips}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.completedTrips}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {d.totalKm > 0 ? `${fmtKm(d.totalKm)} km` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.totalDeliveries}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                        {d.lastTripDate ? fmtDate(d.lastTripDate) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.activeNow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                            Em rota
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Disponível
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: POR VEÍCULO ─────────────────────────────────────────────── */}
      {activeTab === "veiculos" && (
        <div className="space-y-4">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              label="Veículos ativos"
              value={vehicles.filter((v) => v.isActive).length}
            />
            <SummaryCard label="Rotas no período" value={tripsByPeriod.length} />
            <SummaryCard
              label="KM no período"
              value={`${fmtKm(totalKmPeriodo)} km`}
              color="blue"
            />
            <SummaryCard
              label="Veículos em rota"
              value={vehicleStats.filter((v) => v.activeNow).length}
              color="orange"
            />
          </div>

          {/* Tabela + export */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Desempenho por veículo</p>
              <button
                onClick={exportVeiculosCSV}
                className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-800"
              >
                Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Veículo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Placa</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">KM Atual</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Rotas</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Concluídas</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">KM Rodado</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Entregas</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Última Rota</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicleStats.map((v) => (
                    <tr
                      key={v.id}
                      className={`hover:bg-gray-50 ${!v.isActive ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{v.model}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                          {v.plate}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">
                        {fmtKm(v.current_km)} km
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{v.totalTrips}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{v.completedTrips}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-700">
                        {v.totalKm > 0 ? `${fmtKm(v.totalKm)} km` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{v.totalDeliveries}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                        {v.lastTripDate ? fmtDate(v.lastTripDate) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!v.isActive ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            Inativo
                          </span>
                        ) : v.activeNow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                            Em rota
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Disponível
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color = "gray",
}: {
  label: string;
  value: string | number;
  color?: "gray" | "blue" | "green" | "orange";
}) {
  const colorClass = {
    gray: "text-gray-900",
    blue: "text-blue-700",
    green: "text-green-700",
    orange: "text-orange-600",
  }[color];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
