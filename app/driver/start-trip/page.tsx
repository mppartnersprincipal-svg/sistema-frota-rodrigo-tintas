import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import StartTripForm from "./StartTripForm";

export default async function StartTripPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/admin");

  // Se já há rota ativa, redireciona
  const activeTrip = await prisma.trip.findFirst({
    where: { userId: user.id, status: "IN_PROGRESS" },
  });
  if (activeTrip) redirect("/driver/active-trip");

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    orderBy: { model: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <Link
          href="/driver"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nova Saída</h1>
      </header>

      <StartTripForm vehicles={vehicles} />
    </div>
  );
}
