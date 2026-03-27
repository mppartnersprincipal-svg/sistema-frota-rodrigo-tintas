"use client";

import { useActionState, useState } from "react";
import { updateDriverPinAction, deleteDriverAction, assignVehicleAction } from "@/app/actions/users";

type Driver = {
  id: string;
  name: string;
  cpf: string;
  pin: string;
  vehicleId: string | null;
  createdAt: Date;
  _count: { trips: number };
};

type Vehicle = { id: string; model: string; plate: string };

function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export default function DriverRow({ driver, vehicles }: { driver: Driver; vehicles: Vehicle[] }) {
  const [editingPin, setEditingPin] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [pinState, pinAction, pinPending] = useActionState(updateDriverPinAction, null);
  const [vehicleState, vehicleAction, vehiclePending] = useActionState(assignVehicleAction, null);

  const linkedVehicle = vehicles.find((v) => v.id === driver.vehicleId);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div>
          <p className="font-bold text-gray-900">{driver.name}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            CPF: {formatCpf(driver.cpf)}
          </p>
          <p className="text-sm text-gray-500">
            PIN atual: <span className="font-mono font-bold">{driver.pin}</span>
            {" · "}
            <span>{driver._count.trips} viagem(ns)</span>
          </p>
          <p className="text-sm text-gray-500">
            Veículo:{" "}
            {linkedVehicle ? (
              <span className="font-semibold text-gray-800">
                {linkedVehicle.model} — {linkedVehicle.plate}
              </span>
            ) : (
              <span className="font-semibold text-red-500">Nenhum vinculado</span>
            )}
          </p>
        </div>

        {/* Ações */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={() => { setEditingPin((v) => !v); setEditingVehicle(false); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {editingPin ? "Cancelar" : "Editar PIN"}
          </button>
          <button
            onClick={() => { setEditingVehicle((v) => !v); setEditingPin(false); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {editingVehicle ? "Cancelar" : "Vincular Veículo"}
          </button>

          <form action={deleteDriverAction}>
            <input type="hidden" name="userId" value={driver.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              onClick={(e) => {
                if (!confirm(`Remover ${driver.name}?`)) e.preventDefault();
              }}
            >
              Remover
            </button>
          </form>
        </div>
      </div>

      {/* Edição inline de PIN */}
      {editingPin && (
        <form action={pinAction} className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
          <input type="hidden" name="userId" value={driver.id} />
          <input
            name="pin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Novo PIN"
            required
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-center font-mono text-lg font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pinPending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pinPending ? "…" : "Salvar"}
          </button>
          {pinState?.success && <span className="text-sm text-green-600">{pinState.success}</span>}
          {pinState?.error && <span className="text-sm text-red-600">{pinState.error}</span>}
        </form>
      )}

      {/* Vincular veículo */}
      {editingVehicle && (
        <form action={vehicleAction} className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
          <input type="hidden" name="userId" value={driver.id} />
          <select
            name="vehicleId"
            defaultValue={driver.vehicleId ?? ""}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="">— Sem veículo —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} — {v.plate}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={vehiclePending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {vehiclePending ? "…" : "Salvar"}
          </button>
          {vehicleState?.success && <span className="text-sm text-green-600">{vehicleState.success}</span>}
          {vehicleState?.error && <span className="text-sm text-red-600">{vehicleState.error}</span>}
        </form>
      )}
    </div>
  );
}
