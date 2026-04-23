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
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden ${!vehicle.isActive ? "opacity-60" : "border-gray-200"}`}>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900 text-base">{vehicle.model}</p>
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-gray-600">
            {vehicle.plate}
          </span>
          {!vehicle.isActive && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
              Inativo
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          KM atual: <span className="font-bold text-gray-800">{vehicle.current_km.toLocaleString("pt-BR")}</span>
          <span className="mx-1 text-gray-300">·</span>
          {vehicle._count.trips} viagem(ns)
        </p>
      </div>

      {/* Ações */}
      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        <button
          onClick={() => setEditing((v) => !v)}
          className={`py-3 text-sm font-semibold text-center transition-colors
            ${editing ? "bg-blue-50 text-blue-700" : "text-gray-600 active:bg-gray-50"}`}
        >
          {editing ? "Cancelar" : "Editar"}
        </button>

        <form action={toggleVehicleAction} className="contents">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <button
            type="submit"
            className="py-3 text-sm font-semibold text-gray-600 text-center active:bg-gray-50"
          >
            {vehicle.isActive ? "Desativar" : "Ativar"}
          </button>
        </form>

        <form action={deleteVehicleAction} className="contents">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <button
            type="submit"
            className="py-3 text-sm font-semibold text-red-600 text-center active:bg-red-50"
            onClick={(e) => {
              if (!confirm(`Remover ${vehicle.model} (${vehicle.plate})?`)) e.preventDefault();
            }}
          >
            Remover
          </button>
        </form>
      </div>

      {/* Edição inline */}
      {editing && (
        <form action={editAction} className="border-t border-gray-100 p-4 space-y-4">
          <input type="hidden" name="vehicleId" value={vehicle.id} />

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Modelo</label>
            <input
              name="model"
              type="text"
              defaultValue={vehicle.model}
              required
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Placa</label>
            <input
              name="plate"
              type="text"
              defaultValue={vehicle.plate}
              required
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base font-mono font-bold uppercase text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">KM Atual</label>
            <input
              name="current_km"
              type="number"
              inputMode="numeric"
              defaultValue={vehicle.current_km}
              required
              min={0}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {editState?.success && <p className="text-sm text-green-600 text-center">{editState.success}</p>}
          {editState?.error && <p className="text-sm text-red-600 text-center">{editState.error}</p>}

          <button
            type="submit"
            disabled={editPending}
            className="w-full rounded-xl bg-blue-700 py-3 text-base font-bold text-white disabled:opacity-60 active:bg-blue-800"
          >
            {editPending ? "Salvando…" : "Salvar Alterações"}
          </button>
        </form>
      )}
    </div>
  );
}
