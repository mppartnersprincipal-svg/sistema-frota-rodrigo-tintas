"use client";

import { useActionState } from "react";
import Link from "next/link";

type ActionFn = (
  prevState: { error?: string } | null,
  formData: FormData
) => Promise<{ error?: string } | null>;

export default function LoginForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      {/* CPF */}
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
          pattern="[0-9]*"
          maxLength={14}
          placeholder="000.000.000-00"
          required
          autoComplete="username"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-xl font-semibold text-gray-900 tracking-wider focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* PIN — PRD §2: teclado numérico forçado */}
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
          autoComplete="current-password"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] text-gray-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Erro */}
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {/* Botão — PRD §2: w-full, mín 56px */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-blue-700 py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
        style={{ minHeight: "56px" }}
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>

      {/* Link para cadastro */}
      <p className="text-center text-sm text-gray-500">
        Primeira vez?{" "}
        <Link
          href="/signup"
          className="font-semibold text-blue-700 underline underline-offset-2"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
