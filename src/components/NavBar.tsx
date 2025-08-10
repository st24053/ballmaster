"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="p-4 flex justify-between items-center bg-blue-600 text-white">
      {/* Title and Home Button */}
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <h1 className="text-xl font-bold">Ballmaster</h1>
      </div>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <Image
            src={session.user.image!}
            alt={session.user.name!}
            width={32}
            height={32}
            className="rounded-full"
          />
          {/* Hide name on small screens */}
          <span className="hidden sm:inline">{session.user.name}</span>

          <a href="/cart" className="underline ml-2">
            Cart
          </a>
          {(session.user as { role?: string })?.role === "admin" && (
            <a href="/admin" className="underline ml-2">
              Admin Dashboard
            </a>
          )}
          <button onClick={handleClick} className="ml-4 underline">
            Sign Out
          </button>
        </div>
      ) : (
        <a href="/login" className="underline">
          Login
        </a>
      )}
    </header>
  );
}