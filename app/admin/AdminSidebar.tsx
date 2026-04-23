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
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            SmartFrota · Admin
          </p>
          <p className="text-sm font-bold text-gray-900 leading-tight">{userName}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 active:bg-gray-50"
          >
            Sair
          </button>
        </form>
      </header>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors
                ${isActive
                  ? "text-blue-700 border-t-2 border-blue-700"
                  : "text-gray-500 border-t-2 border-transparent"
                }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
