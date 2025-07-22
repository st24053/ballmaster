"use client";

import { signIn } from "next-auth/react";
import NavBar from "../../components/NavBar";

export default function AdminPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {/* Inventory Section */}
        <section className="w-full max-w-4xl bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Inventory Overview</h2>
          <div className="flex flex-wrap gap-8 mb-4">
            <div>
              <span className="font-bold">Stock:</span> <span>--</span>
            </div>
            <div>
              <span className="font-bold">Profit:</span> <span>--</span>
            </div>
          </div>
        </section>

        {/* Product Management Section */}
        <section className="w-full max-w-4xl bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <div className="flex gap-4 mb-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">Create Product</button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded">Discontinue Product</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Customise Product</button>
          </div>
          {/* Placeholder for product list */}
          <div className="border rounded p-4 text-gray-500">Product list goes here...</div>
        </section>

        {/* Order Management Section */}
        <section className="w-full max-w-4xl bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          <div className="flex gap-4 mb-4">
            <button className="bg-red-500 text-white px-4 py-2 rounded">Delete Order</button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded">Refund Order</button>
          </div>
          {/* Placeholder for order list */}
          <div className="border rounded p-4 text-gray-500">Order list goes here...</div>
        </section>
      </main>
    </>
  );
}