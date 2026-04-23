"use client";

import { useState, useMemo } from "react";
import TripCharts from "./TripCharts";

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
type Vehicle = { id: string; model: string; plate: string; current_km: number; isActive: boolean };
type Tab = "rotas" | "motoristas" | "veiculos";

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
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TripsClient({ trips, drivers, vehicles }: {
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("rotas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [driverId, setDriverId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const tripsByPeriod = useMemo(() => trips.filter((t) => {
    const start = new Date(t.start_time);
    if (dateFrom && start < new Date(dateFrom + "T00:00:00")) return false;
    if (dateTo && start > new Date(dateTo + "T23:59:59")) return false;
    return true;
  }), [trips, dateFrom, dateTo]);

  const filteredTrips = useMemo(() => tripsByPeriod.filter((t) => {
    if (driverId && t.user.id !== driverId) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  }), [tripsByPeriod, driverId, statusFilter]);

  const driverStats = useMemo(() => drivers.map((d) => {
    const dTrips = tripsByPeriod.filter((t) => t.user.id === d.id);
    const completedTrips = dTrips.filter((t) => t.status === "COMPLETED");
    const totalKm = completedTrips.reduce((acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0), 0);
    const totalDeliveries = dTrips.reduce((acc, t) => acc + t.completedStops, 0);
    return {
      id: d.id, name: d.name,
      totalTrips: dTrips.length,
      completedTrips: completedTrips.length,
      totalKm, totalDeliveries,
      lastTripDate: dTrips[0]?.start_time ?? null,
      activeNow: dTrips.some((t) => t.status === "IN_PROGRESS"),
    };
  }), [drivers, tripsByPeriod]);

  const vehicleStats = useMemo(() => vehicles.map((v) => {
    const vTrips = tripsByPeriod.filter((t) => t.vehicle.id === v.id);
    const completedTrips = vTrips.filter((t) => t.status === "COMPLETED");
    const totalKm = completedTrips.reduce((acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0), 0);
    const totalDeliveries = vTrips.reduce((acc, t) => acc + t.completedStops, 0);
    return {
      id: v.id, model: v.model, plate: v.plate,
      isActive: v.isActive, current_km: v.current_km,
      totalTrips: vTrips.length,
      completedTrips: completedTrips.length,
      totalKm, totalDeliveries,
      lastTripDate: vTrips[0]?.start_time ?? null,
      activeNow: vTrips.some((t) => t.status === "IN_PROGRESS"),
    };
  }), [vehicles, tripsByPeriod]);

  const totalKmPeriodo = tripsByPeriod.reduce((acc, t) => acc + (t.end_km ? t.end_km - t.start_km : 0), 0);
  const totalEntregasPeriodo = tripsByPeriod.reduce((acc, t) => acc + t.completedStops, 0);

  function exportRotasCSV() {
    downloadCSV("rotas",
      ["Data", "Veículo", "Placa", "Motorista", "KM Saída", "KM Chegada", "Distância (km)", "Hr. Saída", "Hr. Chegada", "Pedidos", "Entregas Concluídas", "Total de Entregas", "Status"],
      filteredTrips.map((t) => [fmtDate(t.start_time), t.vehicle.model, t.vehicle.plate, t.user.name, t.start_km, t.end_km ?? "", t.end_km ? t.end_km - t.start_km : "", fmtTime(t.start_time), fmtTime(t.end_time), `"${t.orders}"`, t.completedStops, t.totalSteps, t.status === "COMPLETED" ? "Concluída" : "Em andamento"])
    );
  }

  function exportMotoristasCSV() {
    downloadCSV("motoristas",
      ["Motorista", "Rotas no Período", "Rotas Concluídas", "KM Rodado", "Entregas Realizadas", "Última Rota", "Status"],
      driverStats.map((d) => [d.name, d.totalTrips, d.completedTrips, d.totalKm, d.totalDeliveries, d.lastTripDate ? fmtDate(d.lastTripDate) : "—", d.activeNow ? "Em rota" : "Disponível"])
    );
  }

  function exportVeiculosCSV() {
    downloadCSV("veiculos",
      ["Veículo", "Placa", "KM Atual", "Rotas no Período", "Rotas Concluídas", "KM Rodado", "Entregas Realizadas", "Última Rota", "Status"],
      vehicleStats.map((v) => [v.model, v.plate, v.current_km, v.totalTrips, v.completedTrips, v.totalKm, v.totalDeliveries, v.lastTripDate ? fmtDate(v.lastTripDate) : "—", !v.isActive ? "Inativo" : v.activeNow ? "Em rota" : "Disponível"])
    );
  }

  const tabClass = (tab: Tab) =>
    activeTab === tab
      ? "border-b-2 border-blue-700 text-blue-700 font-bold pb-2 px-1 text-sm"
      : "text-gray-500 hover:text-gray-700 pb-2 px-1 cursor-pointer text-sm";

  return (
    <div className="space-y-4">

      {/* Filtro de período */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-600">Período</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">De</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Até</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">{tripsByPeriod.length} rota(s) no período</span>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs font-medium text-blue-600 underline">
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <TripCharts trips={tripsByPeriod} />

      {/* Abas */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-4">
        <nav className="flex gap-5">
          <button className={tabClass("rotas")} onClick={() => setActiveTab("rotas")}>Rotas</button>
          <button className={tabClass("motoristas")} onClick={() => setActiveTab("motoristas")}>Motoristas</button>
          <button className={tabClass("veiculos")} onClick={() => setActiveTab("veiculos")}>Veículos</button>
        </nav>
      </div>

      {/* ── ABA: ROTAS ─────────────────────────────────────────────────────── */}
      {activeTab === "rotas" && (
        <div className="space-y-3">
          {/* Filtros */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-gray-600">Filtrar</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Motorista</label>
                <select value={driverId} onChange={(e) => setDriverId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none">
                  <option value="">Todos</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none">
                  <option value="">Todos</option>
                  <option value="COMPLETED">Concluída</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500"><b>{filteredTrips.length}</b> rota(s)</span>
              <div className="flex gap-2">
                <button onClick={() => { setDriverId(""); setStatusFilter(""); }}
                  className="text-xs font-medium text-gray-500 underline">Limpar</button>
                <button onClick={exportRotasCSV}
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white active:bg-green-800">
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Cards de rotas */}
          {filteredTrips.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
              Nenhuma rota encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredTrips.map((t) => {
                const dist = t.end_km ? t.end_km - t.start_km : null;
                const isCompleted = t.status === "COMPLETED";
                return (
                  <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {/* Header do card */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.vehicle.model}
                          <span className="ml-1.5 font-mono text-xs font-normal text-gray-400">{t.vehicle.plate}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.user.name} · {fmtDate(t.start_time)}</p>
                      </div>
                      {isCompleted ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Concluída</span>
                      ) : (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />Em andamento
                        </span>
                      )}
                    </div>

                    {/* Dados em grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Saída</p>
                        <p className="font-medium text-gray-800">{fmtTime(t.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Retorno</p>
                        <p className="font-medium text-gray-800">{fmtTime(t.end_time)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">KM Saída</p>
                        <p className="font-medium text-gray-800">{fmtKm(t.start_km)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">KM Chegada</p>
                        <p className="font-medium text-gray-800">{t.end_km ? fmtKm(t.end_km) : "—"}</p>
                      </div>
                      {dist !== null && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Distância</p>
                          <p className="font-bold text-blue-700">{fmtKm(dist)} km</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Entregas</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${t.completedStops === t.totalSteps && isCompleted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-700"}`}>
                          {t.completedStops}/{t.totalSteps}
                        </span>
                      </div>
                    </div>

                    {t.orders && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Pedidos</p>
                        <p className="text-sm text-gray-700 break-words">{t.orders}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABA: POR MOTORISTA ─────────────────────────────────────────────── */}
      {activeTab === "motoristas" && (
        <div className="space-y-3">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Motoristas" value={drivers.length} />
            <SummaryCard label="Rotas no período" value={tripsByPeriod.length} />
            <SummaryCard label="KM no período" value={`${fmtKm(totalKmPeriodo)} km`} color="blue" />
            <SummaryCard label="Entregas realizadas" value={totalEntregasPeriodo} color="green" />
          </div>

          <div className="flex justify-end">
            <button onClick={exportMotoristasCSV}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white active:bg-green-800">
              Exportar CSV
            </button>
          </div>

          {/* Cards de motoristas */}
          <div className="space-y-3">
            {driverStats.map((d) => (
              <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">{d.name}</p>
                  {d.activeNow ? (
                    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />Em rota
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Disponível</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Rotas</p>
                    <p className="font-bold text-gray-900">{d.totalTrips}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Concluídas</p>
                    <p className="font-bold text-gray-900">{d.completedTrips}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">KM Rodado</p>
                    <p className="font-bold text-blue-700">{d.totalKm > 0 ? `${fmtKm(d.totalKm)} km` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Entregas</p>
                    <p className="font-bold text-gray-900">{d.totalDeliveries}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Última Rota</p>
                    <p className="font-medium text-gray-700">{d.lastTripDate ? fmtDate(d.lastTripDate) : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA: POR VEÍCULO ───────────────────────────────────────────────── */}
      {activeTab === "veiculos" && (
        <div className="space-y-3">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Veículos ativos" value={vehicles.filter((v) => v.isActive).length} />
            <SummaryCard label="Em rota agora" value={vehicleStats.filter((v) => v.activeNow).length} color="orange" />
            <SummaryCard label="KM no período" value={`${fmtKm(totalKmPeriodo)} km`} color="blue" />
            <SummaryCard label="Rotas no período" value={tripsByPeriod.length} />
          </div>

          <div className="flex justify-end">
            <button onClick={exportVeiculosCSV}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white active:bg-green-800">
              Exportar CSV
            </button>
          </div>

          {/* Cards de veículos */}
          <div className="space-y-3">
            {vehicleStats.map((v) => (
              <div key={v.id} className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${!v.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{v.model}</p>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-600">{v.plate}</span>
                  </div>
                  {!v.isActive ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Inativo</span>
                  ) : v.activeNow ? (
                    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />Em rota
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Disponível</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">KM Atual</p>
                    <p className="font-bold text-gray-900">{fmtKm(v.current_km)} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Rotas</p>
                    <p className="font-bold text-gray-900">{v.totalTrips}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">KM Rodado</p>
                    <p className="font-bold text-blue-700">{v.totalKm > 0 ? `${fmtKm(v.totalKm)} km` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Entregas</p>
                    <p className="font-bold text-gray-900">{v.totalDeliveries}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Última Rota</p>
                    <p className="font-medium text-gray-700">{v.lastTripDate ? fmtDate(v.lastTripDate) : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color = "gray" }: {
  label: string; value: string | number; color?: "gray" | "blue" | "green" | "orange";
}) {
  const colorClass = { gray: "text-gray-900", blue: "text-blue-700", green: "text-green-700", orange: "text-orange-600" }[color];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
