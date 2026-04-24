"use client";

import { useActionState, useEffect, useState } from "react";
import {
  startStopAction,
  endStopAction,
  startReturnToStoreAction,
  finalizeReturnAction,
} from "@/app/actions/trip";

interface Props {
  tripId: string;
  totalSteps: number;
  currentStep: number;
  hasActiveStop: boolean;
  startKm: number;
  tripStatus: string;
}

const fmt = (n: number) => String(n).padStart(2, "0");

export default function StopControls({
  tripId,
  totalSteps,
  currentStep,
  hasActiveStop,
  startKm,
  tripStatus,
}: Props) {
  const nextStep = currentStep + 1;

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!hasActiveStop) {
      setModalOpen(false);
    }
  }, [hasActiveStop]);

  const [endState, endAction, endPending] = useActionState(endStopAction, null);
  const [returnState, returnAction, returnPending] = useActionState(
    finalizeReturnAction,
    null
  );

  // ---- CHEGADA NA LOJA (retornando) ----
  if (tripStatus === "RETURNING") {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => setModalOpen(true)}
            style={{ minHeight: 56 }}
            className="w-full bg-green-700 text-white text-lg font-bold rounded-xl active:bg-green-800"
          >
            CHEGUEI NA LOJA
          </button>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Chegada na Loja</h2>

              <form action={returnAction} className="space-y-4">
                <input type="hidden" name="tripId" value={tripId} />

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
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-center text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  {returnState?.error && (
                    <p className="text-red-600 text-sm text-center">
                      {returnState.error}
                    </p>
                  )}
                </div>

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
                    disabled={returnPending}
                    style={{ minHeight: 48 }}
                    className="flex-1 bg-green-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {returnPending ? "Salvando…" : "Encerrar Rota"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // ---- TODAS ENTREGAS CONCLUÍDAS — INICIAR RETORNO ----
  if (!hasActiveStop && currentStep === totalSteps) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <form action={startReturnToStoreAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <button
            type="submit"
            style={{ minHeight: 56 }}
            className="w-full bg-orange-500 text-white text-lg font-bold rounded-xl active:bg-orange-600"
          >
            INICIAR ROTA PARA A LOJA
          </button>
        </form>
      </div>
    );
  }

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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => setModalOpen(true)}
          style={{ minHeight: 56 }}
          className="w-full bg-red-600 text-white text-lg font-bold rounded-xl active:bg-red-700"
        >
          FINALIZAR ENTREGA {fmt(currentStep)}/{fmt(totalSteps)}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">
              Finalizar Entrega {fmt(currentStep)}/{fmt(totalSteps)}
            </h2>

            <form action={endAction} className="space-y-4">
              <input type="hidden" name="tripId" value={tripId} />

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
                  {endPending ? "Salvando…" : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
