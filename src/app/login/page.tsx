"use client";

import { signIn } from "next-auth/react";
import NavBar from "../../components/NavBar";
import { useRouter } from 'next/navigation';

// Login page component
export default function LoginPage() {

  const router = useRouter();

  const handleClick = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-6 py-3 rounded font-semibold"
        >
          Sign in with Google
        </button>
      </main>
    </>
  );
}