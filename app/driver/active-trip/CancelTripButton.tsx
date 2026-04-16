"use client";

import { cancelTripAction } from "@/app/actions/trip";

export default function CancelTripButton({ tripId }: { tripId: string }) {
  return (
    <form
      action={cancelTripAction}
      className="fixed bottom-24 right-4 z-40"
      onSubmit={(e) => {
        if (!confirm("Cancelar esta rota? O KM não será salvo.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <button
        type="submit"
        className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-500 shadow-sm active:bg-gray-100"
      >
        Cancelar Rota
      </button>
    </form>
  );
}
