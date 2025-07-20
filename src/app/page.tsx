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
        <p className="mt-6 text-lg text-gray-700">Explore the products!</p>
      </section>

      <footer className="text-center text-sm text-gray-500 py-4">
        © 2023 Ballmaster. All rights reserved.
      </footer>
    </main>
  );
}