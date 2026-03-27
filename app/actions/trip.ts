"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");
  return userId;
}

export async function startTripAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const userId = await getUserId();

  const vehicleId = formData.get("vehicleId") as string;
  const start_km = parseInt(formData.get("start_km") as string, 10);
  const orders = formData.get("orders") as string;

  if (!vehicleId || isNaN(start_km) || !orders.trim()) {
    return { error: "Preencha todos os campos corretamente." };
  }

  // Verificar se já há uma rota em andamento para esse motorista
  const activeTrip = await prisma.trip.findFirst({
    where: { userId, status: "IN_PROGRESS" },
  });
  if (activeTrip) {
    return { error: "Você já possui uma rota em andamento." };
  }

  // Gerar horário no servidor — motorista não controla o horário
  await prisma.trip.create({
    data: {
      userId,
      vehicleId,
      start_km,
      start_time: new Date(),
      orders: orders.trim(),
      status: "IN_PROGRESS",
    },
  });

  redirect("/driver/active-trip");
}

export async function endTripAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const userId = await getUserId();

  const tripId = formData.get("tripId") as string;
  const end_km = parseInt(formData.get("end_km") as string, 10);

  if (!tripId || isNaN(end_km)) {
    return { error: "Dados inválidos." };
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });

  if (!trip || trip.userId !== userId || trip.status !== "IN_PROGRESS") {
    return { error: "Rota não encontrada ou já encerrada." };
  }

  if (end_km <= trip.start_km) {
    return {
      error: `KM Final deve ser maior que o KM Inicial (${trip.start_km} km).`,
    };
  }

  // Transação: atualiza a Trip + atualiza o KM do Veículo
  await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: {
        end_km,
        end_time: new Date(),
        status: "COMPLETED",
      },
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { current_km: end_km },
    }),
  ]);

  redirect("/driver");
}
