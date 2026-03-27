import { loginAction } from "@/app/actions/auth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Logo / Marca */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-700 shadow-lg">
          <span className="text-4xl font-black text-white">RT</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SmartFrota</h1>
        <p className="mt-1 text-sm text-gray-500">Rodrigo Tintas</p>
      </div>

      <LoginForm action={loginAction} />
    </main>
  );
}
