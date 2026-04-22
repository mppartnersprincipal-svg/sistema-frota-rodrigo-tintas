"use client";

import { useActionState, useState } from "react";
import { updateVehicleAction, toggleVehicleAction, deleteVehicleAction } from "@/app/actions/vehicles";

type Vehicle = {
  id: string;
  model: string;
  plate: string;
  current_km: number;
  isActive: boolean;
  _count: { trips: number };
};

export default function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  const [editing, setEditing] = useState(false);
  const [editState, editAction, editPending] = useActionState(updateVehicleAction, null);

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
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {editing ? "Cancelar" : "Editar"}
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

      {editing && (
        <form
          action={editAction}
          className="mt-3 border-t border-gray-100 pt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <input type="hidden" name="vehicleId" value={vehicle.id} />

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Modelo
            </label>
            <input
              name="model"
              type="text"
              defaultValue={vehicle.model}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Placa
            </label>
            <input
              name="plate"
              type="text"
              defaultValue={vehicle.plate}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono font-bold text-gray-900 focus:border-blue-600 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              KM Atual
            </label>
            <input
              name="current_km"
              type="number"
              inputMode="numeric"
              defaultValue={vehicle.current_km}
              required
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={editPending}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {editPending ? "Salvando…" : "Salvar Alterações"}
            </button>
            {editState?.success && (
              <span className="text-sm font-medium text-green-600">{editState.success}</span>
            )}
            {editState?.error && (
              <span className="text-sm font-medium text-red-600">{editState.error}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
