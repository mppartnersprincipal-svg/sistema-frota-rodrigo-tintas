"use client";

import { useActionState } from "react";

type Vehicle = {
  id: string;
  model: string;
  plate: string;
};

type ActionFn = (
  prevState: { error?: string } | null,
  formData: FormData
) => Promise<{ error?: string } | null>;

export default function SignupForm({
  action,
  vehicles,
}: {
  action: ActionFn;
  vehicles: Vehicle[];
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Nome completo */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-base font-semibold text-gray-700"
        >
          Nome Completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ex: Carlos Silva"
          required
          autoComplete="name"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* CPF — teclado numérico */}
      <div>
        <label
          htmlFor="cpf"
          className="mb-2 block text-base font-semibold text-gray-700"
        >
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
          autoComplete="username"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-xl font-semibold tracking-wider text-gray-900 focus:border-blue-600 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Usado para entrar no sistema.
        </p>
      </div>

      {/* PIN */}
      <div>
        <label
          htmlFor="pin"
          className="mb-2 block text-base font-semibold text-gray-700"
        >
          PIN (4 dígitos)
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="••••"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] text-gray-900 focus:border-blue-600 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Sua senha de acesso rápido.
        </p>
      </div>

      {/* Confirmar PIN */}
      <div>
        <label
          htmlFor="pinConfirm"
          className="mb-2 block text-base font-semibold text-gray-700"
        >
          Confirmar PIN
        </label>
        <input
          id="pinConfirm"
          name="pinConfirm"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="••••"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 pt-1">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Seu Veículo</p>
      </div>

      {/* Dropdown de veículos */}
      <div>
        <label
          htmlFor="vehicleId"
          className="mb-2 block text-base font-semibold text-gray-700"
        >
          Selecione o Veículo
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          required
          defaultValue=""
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg text-gray-900 focus:border-blue-600 focus:outline-none"
        >
          <option value="" disabled>
            Escolha seu veículo...
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} — {v.plate}
            </option>
          ))}
        </select>
      </div>

      {/* Erro */}
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-blue-700 py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
        style={{ minHeight: "56px" }}
      >
        {isPending ? "Cadastrando…" : "Criar Conta"}
      </button>
    </form>
  );
}
