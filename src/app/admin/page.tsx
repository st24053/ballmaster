"use client";

import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import AdminProductForm from "@/components/adminProductForm";
import { getProducts, discontinueProduct } from "@/app/lib/productService";

// Import or define the Product type
import type { Product } from "@/app/types/product";

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch products on load
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const fetched = await getProducts();
      setProducts(fetched);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Handle discontinuing a product
  const handleDiscontinue = async (id: string) => {
    await discontinueProduct(id); // You'd set a `discontinued: true` field, or delete
    setProducts(products.filter(p => p.id !== id));
  };

  const handleCustomise = (product: Product) => {
    // Ensure all required fields are present
    const completeProduct: Product = {
      ...product
    };
    setEditingProduct(completeProduct);
    setShowForm(true);
  };
  
  const handleCreateClick = () => {
    setEditingProduct(null); // new product, no prior data
    setShowForm(true);
  };

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
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Hide Form" : "Create Product"}
            </button>
          </div>

          {showForm && (
            <AdminProductForm
              initialValues={editingProduct}
              onDone={async () => {
                setShowForm(false);
                setEditingProduct(null);
                const refreshed = await getProducts();
                setProducts(refreshed);
              }}
            />
          )}

          {/* Product List */}
          <div className="mt-6">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">No products found.</p>
            ) : (
              <table className="w-full text-left border mt-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Stock</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-2 border">{product.name}</td>
                      <td className="p-2 border">${product.price}</td>
                      <td className="p-2 border">{product.stock}</td>
                      <td className="p-2 border">
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                          onClick={() => handleCustomise(product)}
                        >
                          Customise
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDiscontinue(product.id)}
                        >
                          Discontinue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Order Management Section */}
        <section className="w-full max-w-4xl bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          <div className="flex gap-4 mb-4">
            <button className="bg-red-500 text-white px-4 py-2 rounded">Delete Order</button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded">Refund Order</button>
          </div>
          <div className="border rounded p-4 text-gray-500">Order list goes here...</div>
        </section>
      </main>
    </>
  );
}
