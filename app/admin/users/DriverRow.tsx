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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Info */}
      <div className="p-4">
        <p className="font-bold text-gray-900 text-base">{driver.name}</p>
        <p className="mt-1 text-sm text-gray-500">CPF: {formatCpf(driver.cpf)}</p>
        <p className="text-sm text-gray-500">
          PIN: <span className="font-mono font-bold text-gray-800">{driver.pin}</span>
          <span className="mx-1 text-gray-300">·</span>
          {driver._count.trips} viagem(ns)
        </p>
        <p className="text-sm text-gray-500">
          Veículo:{" "}
          {linkedVehicle ? (
            <span className="font-semibold text-gray-800">{linkedVehicle.model} — {linkedVehicle.plate}</span>
          ) : (
            <span className="font-semibold text-red-500">Nenhum vinculado</span>
          )}
        </p>
      </div>

      {/* Ações */}
      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        <button
          onClick={() => { setEditingPin((v) => !v); setEditingVehicle(false); }}
          className={`py-3 text-sm font-semibold text-center transition-colors
            ${editingPin ? "bg-blue-50 text-blue-700" : "text-gray-600 active:bg-gray-50"}`}
        >
          {editingPin ? "Cancelar" : "Editar PIN"}
        </button>
        <button
          onClick={() => { setEditingVehicle((v) => !v); setEditingPin(false); }}
          className={`py-3 text-sm font-semibold text-center transition-colors
            ${editingVehicle ? "bg-blue-50 text-blue-700" : "text-gray-600 active:bg-gray-50"}`}
        >
          {editingVehicle ? "Cancelar" : "Veículo"}
        </button>
        <form action={deleteDriverAction}>
          <input type="hidden" name="userId" value={driver.id} />
          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-red-600 text-center active:bg-red-50"
            onClick={(e) => { if (!confirm(`Remover ${driver.name}?`)) e.preventDefault(); }}
          >
            Remover
          </button>
        </form>
      </div>

      {/* Edição de PIN */}
      {editingPin && (
        <form action={pinAction} className="border-t border-gray-100 p-4 space-y-3">
          <input type="hidden" name="userId" value={driver.id} />
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Novo PIN</label>
          <input
            name="pin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="4 dígitos"
            required
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-center font-mono text-2xl font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
          />
          {pinState?.success && <p className="text-sm text-green-600 text-center">{pinState.success}</p>}
          {pinState?.error && <p className="text-sm text-red-600 text-center">{pinState.error}</p>}
          <button
            type="submit"
            disabled={pinPending}
            className="w-full rounded-xl bg-blue-700 py-3 text-base font-bold text-white disabled:opacity-60 active:bg-blue-800"
          >
            {pinPending ? "Salvando…" : "Salvar PIN"}
          </button>
        </form>
      )}

      {/* Vincular veículo */}
      {editingVehicle && (
        <form action={vehicleAction} className="border-t border-gray-100 p-4 space-y-3">
          <input type="hidden" name="userId" value={driver.id} />
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Selecionar Veículo</label>
          <select
            name="vehicleId"
            defaultValue={driver.vehicleId ?? ""}
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="">— Sem veículo —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.model} — {v.plate}</option>
            ))}
          </select>
          {vehicleState?.success && <p className="text-sm text-green-600 text-center">{vehicleState.success}</p>}
          {vehicleState?.error && <p className="text-sm text-red-600 text-center">{vehicleState.error}</p>}
          <button
            type="submit"
            disabled={vehiclePending}
            className="w-full rounded-xl bg-blue-700 py-3 text-base font-bold text-white disabled:opacity-60 active:bg-blue-800"
          >
            {vehiclePending ? "Salvando…" : "Salvar"}
          </button>
        </form>
      )}
    </div>
  );
}
