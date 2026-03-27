"use client";

import { useActionState, useState } from "react";
import { updateVehicleKmAction, toggleVehicleAction, deleteVehicleAction } from "@/app/actions/vehicles";

type Vehicle = {
  id: string;
  model: string;
  plate: string;
  current_km: number;
  isActive: boolean;
  _count: { trips: number };
};

export default function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  const [editingKm, setEditingKm] = useState(false);
  const [kmState, kmAction, kmPending] = useActionState(updateVehicleKmAction, null);

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${!vehicle.isActive ? "opacity-60" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{vehicle.model}</p>
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-gray-600">
              {vehicle.plate}
            </span>
            {!vehicle.isActive && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                Inativo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            KM atual: <span className="font-bold text-gray-800">{vehicle.current_km.toLocaleString("pt-BR")}</span>
            {" · "}
            {vehicle._count.trips} viagem(ns)
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={() => setEditingKm((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {editingKm ? "Cancelar" : "Editar KM"}
          </button>

          <form action={toggleVehicleAction}>
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {vehicle.isActive ? "Desativar" : "Ativar"}
            </button>
          </form>

          <form action={deleteVehicleAction}>
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              onClick={(e) => {
                if (!confirm(`Remover ${vehicle.model} (${vehicle.plate})?`)) e.preventDefault();
              }}
            >
              Remover
            </button>
          </form>
        </div>
      </div>

      {editingKm && (
        <form action={kmAction} className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <input
            name="current_km"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={vehicle.current_km}
            required
            className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-base font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={kmPending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {kmPending ? "…" : "Salvar"}
          </button>
          {kmState?.success && <span className="text-sm text-green-600">{kmState.success}</span>}
          {kmState?.error && <span className="text-sm text-red-600">{kmState.error}</span>}
        </form>
      )}
    </div>
  );
}
