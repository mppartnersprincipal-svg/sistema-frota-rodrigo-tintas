"use client";

import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer,
} from "recharts";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as LineTooltip, CartesianGrid, ResponsiveContainer as LineContainer,
} from "recharts";

type Trip = {
  start_time: string;
  status: string;
};

const PIE_COLORS = ["#16a34a", "#f59e0b", "#6b7280"];

export default function TripCharts({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;

  // ── Pie: status distribution ──────────────────────────────────────────────
  const completed = trips.filter((t) => t.status === "COMPLETED").length;
  const inProgress = trips.filter((t) => t.status === "IN_PROGRESS").length;
  const cancelled = trips.filter((t) => t.status === "CANCELLED").length;

  const pieData = [
    { name: "Concluídas", value: completed },
    { name: "Em andamento", value: inProgress },
    { name: "Canceladas", value: cancelled },
  ].filter((d) => d.value > 0);

  // ── Line: routes per day ──────────────────────────────────────────────────
  const byDay = new Map<string, { label: string; rotas: number }>();

  trips.forEach((t) => {
    const key = new Date(t.start_time).toLocaleDateString("sv", {
      timeZone: "America/Sao_Paulo",
    });
    const label = new Date(t.start_time).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
    });
    const existing = byDay.get(key);
    if (existing) {
      existing.rotas++;
    } else {
      byDay.set(key, { label, rotas: 1 });
    }
  });

  const lineData = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Pizza */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-gray-700">Status das Rotas</p>
        <p className="mb-3 text-xs text-gray-400">Distribuição no período selecionado</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={35}
              paddingAngle={3}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value, name) => [`${value} rota(s)`, name]}
            />
            <PieLegend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Linha */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-gray-700">Rotas por Dia</p>
        <p className="mb-3 text-xs text-gray-400">Volume diário no período</p>
        <LineContainer width="100%" height={200}>
          <LineChart data={lineData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <LineTooltip
              formatter={(value) => [`${value} rota(s)`, "Rotas"]}
            />
            <Line
              type="monotone"
              dataKey="rotas"
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1d4ed8" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </LineContainer>
      </div>
    </div>
  );
}
