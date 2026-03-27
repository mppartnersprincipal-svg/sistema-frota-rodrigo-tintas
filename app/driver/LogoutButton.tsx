"use client";

import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 active:bg-gray-100"
      >
        Sair
      </button>
    </form>
  );
}
