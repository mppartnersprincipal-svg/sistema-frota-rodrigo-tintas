"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/admin/trips", label: "Relatórios", icon: "📊" },
  { href: "/admin/users", label: "Motoristas", icon: "👤" },
  { href: "/admin/vehicles", label: "Veículos", icon: "🚐" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="border-b border-gray-100 px-5 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SmartFrota</p>
        <p className="mt-0.5 text-base font-bold text-gray-900">Rodrigo Tintas</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-800 truncate">{userName}</p>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
