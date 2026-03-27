import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white px-6 py-10">
      {/* Cabeçalho */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-700 shadow-lg">
          <span className="text-4xl font-black text-white">RT</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p className="mt-1 text-sm text-gray-500">SmartFrota — Rodrigo Tintas</p>
      </div>

      <SignupForm action={signupAction} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 underline underline-offset-2"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
