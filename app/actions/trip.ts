"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  // Bloqueia nova rota se já houver uma ativa ou em retorno
  const activeTrip = await prisma.trip.findFirst({
    where: { userId, status: { in: ["IN_PROGRESS", "RETURNING"] } },
  });
  if (activeTrip) {
    return { error: "Você já possui uma rota em andamento." };
  }

  const totalStepsRaw = formData.get("totalSteps") as string | null;
  const parsedSteps = parseInt(totalStepsRaw ?? "", 10);
  const orderList = orders.split(",").map((s) => s.trim()).filter(Boolean);
  const totalSteps =
    !isNaN(parsedSteps) && parsedSteps > 0 ? parsedSteps : orderList.length || 1;

  await prisma.trip.create({
    data: {
      userId,
      vehicleId,
      start_km,
      start_time: new Date(),
      orders: orders.trim(),
      totalSteps,
      currentStep: 0,
      status: "IN_PROGRESS",
    },
  });

  redirect("/driver/active-trip");
}

export async function startStopAction(formData: FormData): Promise<void> {
  const userId = await getUserId();

  const tripId = formData.get("tripId") as string;
  if (!tripId) redirect("/driver");

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip || trip.userId !== userId || trip.status !== "IN_PROGRESS") {
    redirect("/driver");
  }

  if (trip.currentStep >= trip.totalSteps) {
    redirect("/driver/active-trip");
  }

  await prisma.$transaction([
    prisma.tripStop.create({
      data: {
        tripId,
        stepNumber: trip.currentStep + 1,
        start_time: new Date(),
        status: "IN_PROGRESS",
      },
    }),
    prisma.trip.update({
      where: { id: tripId },
      data: { currentStep: { increment: 1 } },
    }),
  ]);

  revalidatePath("/driver/active-trip");
}

export async function endStopAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const userId = await getUserId();

  const tripId = formData.get("tripId") as string;

  if (!tripId) {
    return { error: "Dados inválidos." };
  }

  let trip;
  try {
    trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: true },
    });
  } catch {
    return { error: "Erro ao buscar rota. Tente novamente." };
  }

  if (!trip || trip.userId !== userId || trip.status !== "IN_PROGRESS") {
    return { error: "Rota não encontrada ou já encerrada." };
  }

  const activeStop =
    trip.stops.find(
      (s) => s.status === "IN_PROGRESS" && s.stepNumber === trip.currentStep
    ) ?? trip.stops.find((s) => s.status === "IN_PROGRESS");

  if (!activeStop) {
    return { error: "Nenhuma parada ativa encontrada." };
  }

  // Todas as paradas: apenas confirma conclusão; KM só é pedido na chegada da loja
  try {
    await prisma.tripStop.update({
      where: { id: activeStop.id },
      data: { end_time: new Date(), status: "COMPLETED" },
    });
  } catch {
    return { error: "Erro ao salvar entrega. Tente novamente." };
  }

  revalidatePath("/driver/active-trip");
  return null;
}

// Alias mantido para compatibilidade com código legado
export const endTripAction = endStopAction;

export async function startReturnToStoreAction(formData: FormData): Promise<void> {
  const userId = await getUserId();
  const tripId = formData.get("tripId") as string;
  if (!tripId) redirect("/driver");

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId || trip.status !== "IN_PROGRESS") {
    redirect("/driver");
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: { status: "RETURNING" },
  });

  revalidatePath("/driver/active-trip");
}

export async function finalizeReturnAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const userId = await getUserId();
  const tripId = formData.get("tripId") as string;
  const end_km_raw = formData.get("end_km") as string | null;

  if (!tripId) return { error: "Dados inválidos." };

  let trip;
  try {
    trip = await prisma.trip.findUnique({ where: { id: tripId } });
  } catch {
    return { error: "Erro ao buscar rota. Tente novamente." };
  }

  if (!trip || trip.userId !== userId || trip.status !== "RETURNING") {
    return { error: "Rota não encontrada ou em estado inválido." };
  }

  const end_km = parseInt(end_km_raw ?? "", 10);
  if (isNaN(end_km)) {
    return { error: "Informe o KM Final para encerrar a rota." };
  }
  if (end_km <= trip.start_km) {
    return {
      error: `KM Final deve ser maior que o KM de Saída (${trip.start_km} km).`,
    };
  }

  try {
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { end_km, end_time: new Date(), status: "COMPLETED" },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { current_km: end_km },
      }),
    ]);
  } catch {
    return { error: "Erro ao encerrar a rota. Tente novamente." };
  }

  redirect("/driver");
}

export async function cancelTripAction(formData: FormData): Promise<void> {
  const userId = await getUserId();
  const tripId = formData.get("tripId") as string;
  if (!tripId) redirect("/driver");

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (
    !trip ||
    trip.userId !== userId ||
    !["IN_PROGRESS", "RETURNING"].includes(trip.status)
  ) {
    redirect("/driver");
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: { status: "CANCELLED", end_time: new Date() },
  });

  redirect("/driver");
}
