"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole")?.value;
  if (role !== "ADMIN") redirect("/login");
}

export async function createVehicleAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const model = (formData.get("model") as string).trim();
  const plate = (formData.get("plate") as string).trim().toUpperCase();
  const current_km = parseInt(formData.get("current_km") as string, 10);

  if (!model) return { error: "Informe o tipo/modelo do veículo." };
  if (!plate) return { error: "Informe a placa do veículo." };
  if (isNaN(current_km) || current_km < 0) return { error: "KM atual inválido." };

  const existing = await prisma.vehicle.findUnique({ where: { plate } });
  if (existing) return { error: `Placa ${plate} já cadastrada.` };

  await prisma.vehicle.create({ data: { model, plate, current_km } });

  revalidatePath("/admin/vehicles");
  return { success: `Veículo ${model} (${plate}) cadastrado com sucesso.` };
}

export async function updateVehicleKmAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const vehicleId = formData.get("vehicleId") as string;
  const current_km = parseInt(formData.get("current_km") as string, 10);

  if (isNaN(current_km) || current_km < 0) return { error: "KM inválido." };

  await prisma.vehicle.update({ where: { id: vehicleId }, data: { current_km } });

  revalidatePath("/admin/vehicles");
  return { success: "KM atualizado." };
}

export async function updateVehicleAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const vehicleId = formData.get("vehicleId") as string;
  const model = (formData.get("model") as string).trim();
  const plate = (formData.get("plate") as string).trim().toUpperCase();
  const current_km = parseInt(formData.get("current_km") as string, 10);

  if (!model) return { error: "Informe o modelo do veículo." };
  if (!plate) return { error: "Informe a placa." };
  if (isNaN(current_km) || current_km < 0) return { error: "KM inválido." };

  const existing = await prisma.vehicle.findUnique({ where: { plate } });
  if (existing && existing.id !== vehicleId) return { error: `Placa ${plate} já está em uso.` };

  await prisma.vehicle.update({ where: { id: vehicleId }, data: { model, plate, current_km } });

  revalidatePath("/admin/vehicles");
  return { success: "Veículo atualizado com sucesso." };
}

export async function toggleVehicleAction(formData: FormData) {
  await requireAdmin();

  const vehicleId = formData.get("vehicleId") as string;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return;

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isActive: !vehicle.isActive },
  });

  revalidatePath("/admin/vehicles");
}

export async function deleteVehicleAction(formData: FormData) {
  await requireAdmin();

  const vehicleId = formData.get("vehicleId") as string;

  const activeTrip = await prisma.trip.findFirst({
    where: { vehicleId, status: "IN_PROGRESS" },
  });
  if (activeTrip) return;

  await prisma.vehicle.delete({ where: { id: vehicleId } });
  revalidatePath("/admin/vehicles");
}
