"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const pin = formData.get("pin") as string;

  if (!pin || pin.length !== 4) {
    return { error: "PIN deve ter 4 dígitos." };
  }

  const user = await prisma.user.findUnique({ where: { pin } });

  if (!user) {
    return { error: "PIN inválido. Tente novamente." };
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
