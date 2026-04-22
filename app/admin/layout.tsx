import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userName={user.name} />
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
