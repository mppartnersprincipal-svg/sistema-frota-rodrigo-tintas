"use client";

import { useActionState, useEffect, useState } from "react";
import { startStopAction, endStopAction } from "@/app/actions/trip";

interface Props {
  tripId: string;
  totalSteps: number;
  currentStep: number; // 0 = nenhuma parada iniciada
  hasActiveStop: boolean;
  startKm: number;
}

const fmt = (n: number) => String(n).padStart(2, "0");

export default function StopControls({
  tripId,
  totalSteps,
  currentStep,
  hasActiveStop,
  startKm,
}: Props) {
  const isLastStop = currentStep === totalSteps;
  const nextStep = currentStep + 1;

  // --- estado do modal ---
  const [modalOpen, setModalOpen] = useState(false);

  // Reseta o modal quando a parada ativa é concluída (evita modal abrir automaticamente no próximo ciclo)
  useEffect(() => {
    if (!hasActiveStop) {
      setModalOpen(false);
    }
  }, [hasActiveStop]);

  // action de finalizar parada (intermediária ou final)
  const [endState, endAction, endPending] = useActionState(endStopAction, null);

  // ---- INICIAR PRÓXIMA PARADA ----
  if (!hasActiveStop) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <form action={startStopAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <button
            type="submit"
            style={{ minHeight: 56 }}
            className="w-full bg-blue-700 text-white text-lg font-bold rounded-xl active:bg-blue-800"
          >
            INICIAR ENTREGA {fmt(nextStep)}/{fmt(totalSteps)}
          </button>
        </form>
      </div>
    );
  }

  // ---- FINALIZAR PARADA ----
  return (
    <>
      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => setModalOpen(true)}
          style={{ minHeight: 56 }}
          className="w-full bg-red-600 text-white text-lg font-bold rounded-xl active:bg-red-700"
        >
          FINALIZAR ENTREGA {fmt(currentStep)}/{fmt(totalSteps)}
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">
              Finalizar Entrega {fmt(currentStep)}/{fmt(totalSteps)}
            </h2>

            <form action={endAction} className="space-y-4">
              <input type="hidden" name="tripId" value={tripId} />

              {isLastStop ? (
                /* Última parada — pede KM final */
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    KM de Saída: {startKm.toLocaleString("pt-BR")} km
                  </p>
                  <input
                    type="number"
                    name="end_km"
                    inputMode="numeric"
                    autoFocus
                    placeholder={`Maior que ${startKm}`}
                    style={{ fontSize: "1.5rem" }}
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-center focus:border-blue-500 focus:outline-none"
                  />
                  {endState?.error && (
                    <p className="text-red-600 text-sm text-center">
                      {endState.error}
                    </p>
                  )}
                </div>
              ) : (
                /* Parada intermediária — só confirmação */
                <div className="space-y-2">
                  <p className="text-gray-600 text-center">
                    Confirmar conclusão da entrega {fmt(currentStep)} de{" "}
                    {fmt(totalSteps)}?
                  </p>
                  {endState?.error && (
                    <p className="text-red-600 text-sm text-center">
                      {endState.error}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ minHeight: 48 }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={endPending}
                  style={{ minHeight: 48 }}
                  className="flex-1 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {endPending
                    ? "Salvando…"
                    : isLastStop
                    ? "Encerrar Rota"
                    : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
