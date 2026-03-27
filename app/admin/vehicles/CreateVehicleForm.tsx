"use client";

import { useActionState } from "react";
import { createVehicleAction } from "@/app/actions/vehicles";

export default function CreateVehicleForm() {
  const [state, formAction, isPending] = useActionState(createVehicleAction, null);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="model" className="mb-1 block text-sm font-semibold text-gray-700">
          Tipo / Modelo
        </label>
        <input
          id="model"
          name="model"
          type="text"
          placeholder="Ex: Moto, Carro, Van"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="plate" className="mb-1 block text-sm font-semibold text-gray-700">
          Placa
        </label>
        <input
          id="plate"
          name="plate"
          type="text"
          placeholder="Ex: ABC-1234"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base font-mono font-bold uppercase text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="current_km" className="mb-1 block text-sm font-semibold text-gray-700">
          KM Atual
        </label>
        <input
          id="current_km"
          name="current_km"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ex: 50000"
          defaultValue={0}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="sm:col-span-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-3 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {state.success}
        </p>
      )}

      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isPending ? "Cadastrando…" : "Cadastrar Veículo"}
        </button>
      </div>
    </form>
  );
}
