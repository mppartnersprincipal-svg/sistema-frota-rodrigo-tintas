"use client";

import { useActionState } from "react";
import { createDriverAction } from "@/app/actions/users";

export default function CreateDriverForm() {
  const [state, formAction, isPending] = useActionState(createDriverAction, null);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Nome */}
      <div className="sm:col-span-2">
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">
          Nome Completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ex: Carlos Silva"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* CPF */}
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
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* PIN */}
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
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Feedback */}
      {state?.error && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {state.success}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isPending ? "Cadastrando…" : "Cadastrar Motorista"}
        </button>
      </div>
    </form>
  );
}
