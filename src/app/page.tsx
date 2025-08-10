"use client";

import NavBar from "../components/NavBar";
import { ProductSlider } from "../components/ProductSlider";

export default function Home() {
  return (
    <>
     <NavBar />
      <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <ProductSlider />
      <footer className="text-center text-sm text-gray-500 py-4">
        © Ballmaster. All rights reserved.
      </footer>
    </main>
    </>
  );
}