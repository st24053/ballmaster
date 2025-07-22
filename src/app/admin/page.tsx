"use client";

import { signIn } from "next-auth/react";
import NavBar from "../../components/NavBar";

export default function AdminPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          Welcome nerds
      </main>
    </>
  );
}