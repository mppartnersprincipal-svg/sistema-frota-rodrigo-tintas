"use client";

import { useActionState, useState } from "react";
import { endTripAction } from "@/app/actions/trip";

export default function EndTripModal({
  tripId,
  startKm,
}: {
  tripId: string;
  startKm: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(endTripAction, null);

  return (
    <>
      {/* Botão fixo no rodapé — PRD §2: w-full, vermelho/laranja, mín 48px */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-xl bg-red-600 py-4 text-lg font-bold text-white shadow-md active:scale-95"
          style={{ minHeight: "56px" }}
        >
          FINALIZAR ROTA
        </button>
      </div>

      {/* Modal de Finalização */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-3xl bg-white px-5 pb-8 pt-6 shadow-2xl">
            {/* Handle visual */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-300" />

            <h2 className="mb-1 text-2xl font-bold text-gray-900">
              Encerrar Viagem
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              KM de Saída: <strong>{startKm.toLocaleString("pt-BR")} km</strong>
            </p>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="tripId" value={tripId} />

              {/* KM Final — PRD §2: teclado numérico forçado */}
              <div>
                <label
                  htmlFor="end_km"
                  className="mb-2 block text-base font-semibold text-gray-700"
                >
                  KM Final
                </label>
                <input
                  id="end_km"
                  name="end_km"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`Maior que ${startKm.toLocaleString("pt-BR")}`}
                  required
                  autoFocus
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-2xl font-bold text-gray-900 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Erro de validação */}
              {state?.error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {state.error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-2 border-gray-300 py-4 text-base font-semibold text-gray-700 active:bg-gray-50"
                  style={{ minHeight: "56px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-red-600 py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
                  style={{ minHeight: "56px" }}
                >
                  {isPending ? "Salvando…" : "Encerrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
