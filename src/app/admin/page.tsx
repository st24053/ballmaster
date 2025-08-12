"use client";

import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import AdminProductForm from "@/components/adminProductForm";
import { getProducts, discontinueProduct, getProductsByAuthorEmail } from "@/app/lib/productService";
import { getAllOrders, refundOrder, deleteOrder, confirmOrder } from "@/app/lib/orderService";
import { Order } from "@/app/types/orders";
import { useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import type { Product } from "@/app/types/product"; // Product type definition

export default function AdminPage() {
  // UI state management
  const [showForm, setShowForm] = useState(false);           // Toggles product creation/edit form visibility
  const [products, setProducts] = useState<Product[]>([]);   // List of products owned by the admin
  const [loading, setLoading] = useState(true);               // Loading indicator for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // The product currently being edited
  const [orders, setOrders] = useState<Order[]>([]);          // List of all orders
  const [formKey, setFormKey] = useState(0);                  // Forces form re-render for fresh state
  const { data: session } = useSession();                     // Current logged-in user session

  /**
   * Fetch products and orders on page load (only after session is ready)
   * Products are filtered by the admin's email so they only see their own items
   */
  useEffect(() => {
  async function fetchData() {
    if (!session?.user?.email) return;

    setLoading(true);

    // Get this admin's products
    const fetchedProducts = await getProductsByAuthorEmail(session.user.email);
    setProducts(fetchedProducts);

    // Get all orders
    const fetchedOrders = await getAllOrders();

    // Filter orders for products owned by admin
    const ownedProductIds = new Set(fetchedProducts.map((p) => p.id));
    const filteredOrders = fetchedOrders.filter((order) =>
      ownedProductIds.has(order.product_id)
    );

    setOrders(filteredOrders);
    setLoading(false);
  }
  fetchData();
}, [session]);

  /** Discontinue (remove) a product by its ID */
  const handleDiscontinue = async (id: string) => {
    await discontinueProduct(id);
    setProducts(products.filter((p) => p.id !== id)); // Remove from local state
  };

  /** Open the form for editing an existing product */
  const handleCustomise = (product: Product) => {
    setEditingProduct({ ...product }); // Copy product data
    setShowForm(true);
  };

  /** Open the form for creating a new product */
  const handleCreateClick = () => {
    setEditingProduct(null);           // No existing data for new product
    setFormKey((prev) => prev + 1);     // Trigger a fresh form instance
    setShowForm(true);
  };

  /**
   * Refund an order by ID
   * Updates order list and sends a refund email to the customer
   */
  const handleRefund = async (id: string) => {
    await refundOrder(id);
    const updated = await getAllOrders();
    setOrders(updated);

    // Fetch order details from Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .select("user_email, product_name, quantity, total_price, image_url")
      .eq("id", id)
      .single();

    if (error || !order?.user_email) {
      console.error("Failed to fetch order:", error);
      return;
    }

    // HTML email content
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #F44336;">❌ Order Refunded</h2>
        <p>Your order has been successfully refunded.</p>
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
          <img src="${order.image_url}" alt="${order.product_name}" style="max-width: 300px;" />
          <h3>${order.product_name}</h3>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Total Refunded:</strong> $${order.total_price.toFixed(2)}</p>
        </div>
        <p>– The Ballmaster Team</p>
      </div>
    `;

    // Send refund email via API
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: order.user_email,
        subject: "Your Order Has Been Refunded!",
        html,
      }),
    });
  };

  /** Delete an order from the database */
  const handleDeleteOrder = async (id: string) => {
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  /**
   * Confirm an order by ID
   * Updates order list and sends a confirmation email to the customer
   */
  const handleConfirm = async (id: string) => {
    await confirmOrder(id);
    const updated = await getAllOrders();
    setOrders(updated);

    // Fetch order details from Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .select("user_email, product_name, quantity, total_price, image_url")
      .eq("id", id)
      .single();

    if (error || !order?.user_email) {
      console.error("Failed to fetch order:", error);
      return;
    }

    // HTML email content
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4CAF50;">✅ Order Confirmation</h2>
        <p>Thank you for your purchase. Here’s your order summary:</p>
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
          <img src="${order.image_url}" alt="${order.product_name}" style="max-width: 300px;" />
          <h3>${order.product_name}</h3>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Total Price:</strong> $${order.total_price.toFixed(2)}</p>
        </div>
        <p>– The Ballmaster Team</p>
      </div>
    `;

    // Send confirmation email via API
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: order.user_email,
        subject: "Your Order Has Been Confirmed!",
        html,
      }),
    });
  };

  return (
    <>
      <NavBar />

      {/* Show admin dashboard only if user role is admin */}
      {(session?.user as { role?: string })?.role === "admin" && (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          {/* PRODUCT MANAGEMENT SECTION */}
          <section className="w-full max-w-5xl bg-white rounded shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Product Management</h2>

            {/* Create product button */}
            <div className="flex gap-4 mb-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (!showForm) setEditingProduct(null);
                  setShowForm(!showForm);
                }}
              >
                {showForm ? "Hide Form" : "Create Product"}
              </button>
            </div>

            {/* Product form (create or edit) */}
            {showForm && (
              <AdminProductForm
                key={formKey}
                initialValues={editingProduct}
                onDoneAction={async () => {
                  setShowForm(false);
                  setEditingProduct(null);
                  const refreshed = await getProductsByAuthorEmail(session?.user?.email ?? "");
                  setProducts(refreshed);
                }}
              />
            )}

            {/* Product list table */}
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
                      <th className="p-2 border">Current Stock</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="p-2 border">{product.name}</td>
                        <td className="p-2 border">${product.price}</td>
                        <td className="p-2 border">{product.stock}</td>
                        <td className="p-2 border">{product.current_stock}</td>
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

          {/* ORDER MANAGEMENT SECTION */}
          <section className="w-full max-w-5xl bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>

            {/* Orders table */}
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
                      {/* Clickable customer name that opens Gmail compose */}
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
                        ? new Date(order.created_at)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                            .replace(",", " at")
                        : "N/A"}
                    </td>
                    <td className="p-2 border">{order.status}</td>
                    <td className="p-2 border space-x-2">
                      {/* Actions only available for pending orders */}
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

      {/* If user is not admin */}
      {(session?.user as { role?: string })?.role !== "admin" && (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </main>
      )}
    </>
  );
}
