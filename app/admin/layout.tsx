import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/driver");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar userName={user.name} />
      {/* pt-[57px] = top bar height | pb-[65px] = bottom nav height */}
      <div className="pt-[57px] pb-[65px]">
        {children}
      </div>
    </div>
  );
}
