"use client";

import { useActionState, useEffect, useState } from "react";
import { startTripAction } from "@/app/actions/trip";
import type { Vehicle } from "@/app/generated/prisma/client";

export default function StartTripForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [state, formAction, isPending] = useActionState(startTripAction, null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicles[0]?.id ?? ""
  );
  const [kmValue, setKmValue] = useState("");
  const [deliveryCount, setDeliveryCount] = useState(1);

  function parseCount(text: string) {
    return text.split(",").map((s) => s.trim()).filter(Boolean).length || 1;
  }

  function handleOrdersChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDeliveryCount(parseCount(e.target.value));
  }

  // PRD §3: Ao selecionar veículo, preenche KM automaticamente com o último KM
  useEffect(() => {
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (vehicle) {
      setKmValue(String(vehicle.current_km));
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <form action={formAction} className="flex flex-1 flex-col">
      <div className="flex-1 space-y-6 px-5 py-6">
        {/* Veículo */}
        <div>
          <label
            htmlFor="vehicleId"
            className="mb-2 block text-base font-semibold text-gray-700"
          >
            Veículo
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            style={{ fontSize: "18px" }}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} — {v.plate}
              </option>
            ))}
          </select>
        </div>

        {/* KM Inicial — PRD §2: teclado numérico forçado */}
        <div>
          <label
            htmlFor="start_km"
            className="mb-2 block text-base font-semibold text-gray-700"
          >
            KM Inicial
          </label>
          <input
            id="start_km"
            name="start_km"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={kmValue}
            onChange={(e) => setKmValue(e.target.value)}
            required
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-xl font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            Preenchido automaticamente com o último KM do veículo.
          </p>
        </div>

        {/* Pedidos */}
        <div>
          <label
            htmlFor="orders"
            className="mb-2 block text-base font-semibold text-gray-700"
          >
            Número dos Pedidos
          </label>
          <textarea
            id="orders"
            name="orders"
            rows={3}
            placeholder="Ex: 104010, 104063, 104127"
            required
            onChange={handleOrdersChange}
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            Separe os pedidos por vírgula. O número de entregas será ajustado automaticamente.
          </p>
        </div>

        {/* Número de Entregas */}
        <div>
          <label className="mb-3 block text-base font-semibold text-gray-700">
            Número de Entregas
          </label>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setDeliveryCount((c) => Math.max(1, c - 1))}
              style={{ minHeight: 64, minWidth: 64 }}
              className="flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-white text-3xl font-bold text-gray-700 active:bg-gray-100"
            >
              −
            </button>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-extrabold text-blue-700 leading-none">
                {deliveryCount}
              </span>
              <span className="mt-1 text-sm font-medium text-gray-500">
                {deliveryCount === 1 ? "entrega" : "entregas"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDeliveryCount((c) => c + 1)}
              style={{ minHeight: 64, minWidth: 64 }}
              className="flex items-center justify-center rounded-2xl border-2 border-blue-600 bg-blue-700 text-3xl font-bold text-white active:bg-blue-800"
            >
              +
            </button>
          </div>
          <input type="hidden" name="totalSteps" value={deliveryCount} />
        </div>

        {/* Erro */}
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}
      </div>

      {/* Botão fixo no rodapé — PRD §2: w-full, mín 48px */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-green-700 py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
          style={{ minHeight: "56px" }}
        >
          {isPending ? "Iniciando…" : "Iniciar Rota"}
        </button>
      </div>
    </form>
  );
}
