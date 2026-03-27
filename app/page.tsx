import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

export default async function RootPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "DRIVER") redirect("/driver");
  redirect("/admin");
}
