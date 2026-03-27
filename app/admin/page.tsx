import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
        <p className="mt-2 text-gray-500">Em construção — MVP em andamento.</p>
        <p className="mt-4 text-sm text-gray-400">Olá, {user.name}!</p>
      </div>
    </main>
  );
}
