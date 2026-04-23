"use client";

import { useActionState } from "react";
import { createDriverAction } from "@/app/actions/users";

type Vehicle = { id: string; model: string; plate: string };

export default function CreateDriverForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [state, formAction, isPending] = useActionState(createDriverAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">
          Nome Completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ex: Carlos Silva"
          required
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="cpf" className="mb-1 block text-sm font-semibold text-gray-700">
          CPF
        </label>
        <input
          id="cpf"
          name="cpf"
          type="text"
          inputMode="numeric"
          maxLength={14}
          placeholder="000.000.000-00"
          required
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="pin" className="mb-1 block text-sm font-semibold text-gray-700">
          PIN (4 dígitos)
        </label>
        <input
          id="pin"
          name="pin"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="Ex: 1234"
          required
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="vehicleId" className="mb-1 block text-sm font-semibold text-gray-700">
          Veículo <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        >
          <option value="">— Sem veículo por enquanto —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} — {v.plate}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-blue-700 py-3 text-base font-bold text-white active:bg-blue-800 disabled:opacity-60"
      >
        {isPending ? "Cadastrando…" : "Cadastrar Motorista"}
      </button>
    </form>
  );
}
