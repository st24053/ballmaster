"use client";

import NavBar from "../components/NavBar";
import { ProductSlider } from "../components/ProductSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <section className="p-6">
        <h2 className="text-3xl font-bold mb-4">Products</h2>
        <ProductSlider />
      </section>

      <footer className="text-center text-sm text-gray-500 py-4">
        © Ballmaster. All rights reserved.
      </footer>
    </main>
  );
}