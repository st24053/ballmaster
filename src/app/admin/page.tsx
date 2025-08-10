"use client";

import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import AdminProductForm from "@/components/adminProductForm";
import { getProducts, discontinueProduct } from "@/app/lib/productService";
import { getAllOrders, refundOrder, deleteOrder, confirmOrder} from "@/app/lib/orderService";
import { Order } from "@/app/types/orders"
import { useSession, signOut } from "next-auth/react";
import { supabase } from '../lib/supabaseClient';

// Import or define the Product type
import type { Product } from "@/app/types/product";

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formKey, setFormKey] = useState(0);
  const { data: session } = useSession();

  // Fetch products on load
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fetchedProducts = await getProducts();
      const fetchedOrders = await getAllOrders();
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setLoading(false);
    }
    fetchData();
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
    setFormKey(prev => prev + 1);  // Triggers re-render
    setShowForm(true);
  };

  const handleRefund = async (id: string) => {
  await refundOrder(id);
  const updated = await getAllOrders();
  setOrders(updated);
  // Get order with product info
  const { data: order, error } = await supabase
    .from("orders")
    .select("user_email, product_name, quantity, total_price, image_url")
    .eq("id", id)
    .single();

  if (error || !order?.user_email) {
    console.error("Failed to fetch order:", error);
    return;
  }

  const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #F44336;">❌ Order Refunded</h2>
    <p>Hi there,</p>
    <p>Your order has been successfully refunded. Here are the details:</p>

    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; max-width: 600px;">
      <img src="${order.image_url}" alt="${order.product_name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 10px;" />

      <h3>${order.product_name}</h3>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Total Refunded:</strong> $${order.total_price.toFixed(2)}</p>
    </div>

    <p style="margin-top: 20px;">Please contact us if you have any questions.</p>
    <p>– The Ballmaster Team</p>
  </div>
`;

  await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: order.user_email,
      subject: "Your Order Has Been Refunded!",
      html, // Use HTML version
    }),
  })

  };

  const handleDeleteOrder = async (id: string) => {
  await deleteOrder(id);
  setOrders((prev) => prev.filter((o) => o.id !== id));
  };

const handleConfirm = async (id: string) => {
  await confirmOrder(id);
  const updated = await getAllOrders();
  setOrders(updated);

  // Get order with product info
  const { data: order, error } = await supabase
    .from("orders")
    .select("user_email, product_name, quantity, total_price, image_url")
    .eq("id", id)
    .single();

  if (error || !order?.user_email) {
    console.error("Failed to fetch order:", error);
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #4CAF50;">✅ Order Confirmation</h2>
      <p>Hi there,</p>
      <p>Thank you for your purchase. Here is your order summary:</p>

      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; max-width: 600px;">
        <img src="${order.image_url}" alt="${order.product_name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 10px;" />

        <h3>${order.product_name}</h3>
        <p><strong>Quantity:</strong> ${order.quantity}</p>
        <p><strong>Total Price:</strong> $${order.total_price.toFixed(2)}</p>
      </div>

      <p style="margin-top: 20px;">We'll be in touch shortly!</p>
      <p>– The Ballmaster Team</p>
    </div>
  `;

  await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: order.user_email,
      subject: "Your Order Has Been Confirmed!",
      html, // Use HTML version
    }),
  });
};

  return (
    <>
      <NavBar />
        {(session?.user as { role?: string })?.role === "admin" && (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          {/* Product Management Section */}
          <section className="w-full max-w-5xl bg-white rounded shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Product Management</h2>
            <div className="flex gap-4 mb-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (!showForm) {
                    // Show form and reset editingProduct to create a new product
                    setEditingProduct(null);
                  }
                  setShowForm(!showForm);
                }}
              >
                {showForm ? "Hide Form" : "Create Product"}
              </button>
            </div>

            {showForm && (
              <AdminProductForm
                key={formKey} // Forces remount = fresh form
                initialValues={editingProduct}
                onDoneAction={async () => {
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
              ) : (<table className="w-full text-left border mt-4">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Price</th>
                        <th className="p-2 border">Stock</th>
                        <th className="p-2 border">Current Stock</th> {/* Added this */}
                        <th className="p-2 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t">
                          <td className="p-2 border">{product.name}</td>
                          <td className="p-2 border">${product.price}</td>
                          <td className="p-2 border">{product.stock}</td>
                          <td className="p-2 border">{product.current_stock}</td> {/* Added this */}
                          <td className="p-2 border">
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                              onClick={() => handleCustomise(product)}
                            >
                              Customise
                            </button>
                            {product.id && (
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded"
                              onClick={() => handleDiscontinue(product.id!)}
                            >
                              Discontinue
                            </button>
                          )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
            </div>
          </section>

          {/* Order Management Section */}
          <section className="w-full max-w-5xl bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <table className="w-full text-left border mt-4">
              <thead className="bg-gray-100">
                <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Total ($)</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-2 border">{order.product_name}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.user_email);
                          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                            order.user_email
                          )}&su=${encodeURIComponent("Regarding your order")}&body=${encodeURIComponent(
                            `Hi ${order.customer_name},\n\n`
                          )}`;
                          window.open(gmailUrl, "_blank");
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {order.customer_name}
                      </button>
                    </td>
                    <td className="p-2 border">{order.quantity}</td>
                    <td className="p-2 border">{order.total_price}</td>
                    <td className="p-2 border">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }).replace(",", " at")
                        : "N/A"}
                    </td>
                    <td className="p-2 border">{order.status}</td>
                      <td className="p-2 border space-x-2">
                        {order.status === "pending" && (
                          <>
                            <button
                              className="bg-purple-500 text-white px-2 py-1 rounded"
                              onClick={() => order.id && handleRefund(order.id)}
                            >
                              Refund
                            </button>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded"
                              onClick={() => order.id && handleConfirm(order.id)}
                            >
                              Confirm
                            </button>
                          </>
                        )}
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => order.id && handleDeleteOrder(order.id)}
                        >
                          Delete
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      )}
  {(session?.user as { role?: string })?.role !== "admin" && (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </main>
    )}
    </>
  );
}
