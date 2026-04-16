import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Admin</p>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-6 text-lg font-bold text-gray-700">Painel Administrativo</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/users"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              👤
            </div>
            <div>
              <p className="font-bold text-gray-900">Motoristas</p>
              <p className="text-sm text-gray-500">Cadastrar e gerenciar motoristas</p>
            </div>
          </Link>

          <Link
            href="/admin/vehicles"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              🚐
            </div>
            <div>
              <p className="font-bold text-gray-900">Veículos</p>
              <p className="text-sm text-gray-500">Cadastrar e gerenciar veículos</p>
            </div>
          </Link>

          <Link
            href="/admin/trips"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              📋
            </div>
            <div>
              <p className="font-bold text-gray-900">Relatório de Rotas</p>
              <p className="text-sm text-gray-500">Ver, filtrar e exportar rotas</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
