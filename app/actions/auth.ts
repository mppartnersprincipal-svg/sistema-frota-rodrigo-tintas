"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Remove tudo que não é dígito do CPF
function sanitizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const cpf = sanitizeCpf(formData.get("cpf") as string);
  const pin = formData.get("pin") as string;

  if (cpf.length !== 11) {
    return { error: "CPF inválido. Digite os 11 dígitos." };
  }
  if (!pin || pin.length !== 4) {
    return { error: "PIN deve ter 4 dígitos." };
  }

  const user = await prisma.user.findUnique({ where: { cpf } });

  if (!user || user.pin !== pin) {
    return { error: "CPF ou PIN incorretos." };
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, { httpOnly: true, path: "/" });
  cookieStore.set("userRole", user.role, { httpOnly: true, path: "/" });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/driver");
  }
}

export async function signupAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const name = (formData.get("name") as string).trim();
  const cpf = sanitizeCpf(formData.get("cpf") as string);
  const pin = formData.get("pin") as string;
  const pinConfirm = formData.get("pinConfirm") as string;
  const vehicleId = formData.get("vehicleId") as string;

  if (!name || name.length < 3) {
    return { error: "Nome deve ter pelo menos 3 caracteres." };
  }
  if (cpf.length !== 11) {
    return { error: "CPF inválido. Digite os 11 dígitos." };
  }
  if (!pin || pin.length !== 4) {
    return { error: "PIN deve ter exatamente 4 dígitos." };
  }
  if (pin !== pinConfirm) {
    return { error: "Os PINs não conferem." };
  }
  if (!vehicleId) {
    return { error: "Selecione um veículo." };
  }

  const existing = await prisma.user.findUnique({ where: { cpf } });
  if (existing) {
    return { error: "Já existe uma conta com este CPF." };
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || !vehicle.isActive) {
    return { error: "Veículo não encontrado. Fale com o administrador." };
  }

  const user = await prisma.user.create({
    data: { name, cpf, pin, role: "DRIVER", vehicleId: vehicle.id },
  });

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, { httpOnly: true, path: "/" });
  cookieStore.set("userRole", user.role, { httpOnly: true, path: "/" });

  redirect("/driver");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}
