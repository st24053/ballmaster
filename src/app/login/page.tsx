"use client";

import { signIn } from "next-auth/react";
// Update the import path to the correct location of NavBar
// Update the import path to the correct location of NavBar
import NavBar from "../../components/NavBar";

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-6 py-3 rounded font-semibold"
        >
          Sign in with Google
        </button>
      </main>
    </>
  );
}