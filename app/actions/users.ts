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

function sanitizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

export async function createDriverAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const cpf = sanitizeCpf(formData.get("cpf") as string);
  const pin = formData.get("pin") as string;

  if (!name || name.length < 3) return { error: "Nome deve ter pelo menos 3 caracteres." };
  if (cpf.length !== 11) return { error: "CPF inválido. Digite os 11 dígitos." };
  if (!pin || pin.length !== 4) return { error: "PIN deve ter exatamente 4 dígitos." };

  const existing = await prisma.user.findUnique({ where: { cpf } });
  if (existing) return { error: "Já existe uma conta com este CPF." };

  await prisma.user.create({ data: { name, cpf, pin, role: "DRIVER" } });

  revalidatePath("/admin/users");
  return { success: `Motorista "${name}" cadastrado com sucesso.` };
}

export async function updateDriverPinAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const pin = formData.get("pin") as string;

  if (!pin || pin.length !== 4) return { error: "PIN deve ter exatamente 4 dígitos." };

  await prisma.user.update({ where: { id: userId }, data: { pin } });

  revalidatePath("/admin/users");
  return { success: "PIN atualizado com sucesso." };
}


export async function deleteDriverAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.role === "ADMIN") return;

  // Impede deleção se há viagens em andamento
  const activeTrip = await prisma.trip.findFirst({
    where: { userId, status: "IN_PROGRESS" },
  });
  if (activeTrip) return;

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
