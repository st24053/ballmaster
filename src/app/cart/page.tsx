"use client";

import { useEffect, useState } from "react";
import {
  getLocalCart,
  updateLocalCartItem,
  deleteLocalCartItem,
  purchaseCart,
  refundOrder,
} from "@/app/lib/cartService";
import { supabase } from "@/app/lib/supabaseClient";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavBar";
import { Order } from "@/app/types/orders";

export default function CartPage() {
  const { data: session } = useSession();

  const [localCart, setLocalCart] = useState<Order[]>([]);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);

  useEffect(() => {
    setLocalCart(getLocalCart());
  }, []);

  useEffect(() => {
    const fetchRemoteOrders = async () => {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_email", session?.user?.email);

        if (!error && data) {
          setRemoteOrders(data);
        }
      }
    };

    fetchRemoteOrders();
  }, [session]);

  const handleLocalUpdate = (product_id: string, quantity: number) => {
    const updated = updateLocalCartItem(product_id, quantity);
    setLocalCart(updated);
  };

  const handleLocalDelete = (product_id: string) => {
    const updated = deleteLocalCartItem(product_id);
    setLocalCart(updated);
  };

  const handlePurchase = async () => {
    if (!session?.user) return;
    await purchaseCart(session.user.email || "unknown@example.com", session.user.name || "Unknown");
    setLocalCart([]);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", session?.user?.email);
    setRemoteOrders(data || []);
  };

  const handleRefund = async (id: string) => {
    await refundOrder(id);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", session?.user?.email);
    setRemoteOrders(data || []);

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

  if (!session?.user) return <p className="p-4">Please login to view your cart.</p>;

  const pending = remoteOrders.filter((item) => item.status === "pending");
  const purchased = remoteOrders.filter((item) => item.status === "completed");
  const refunded = remoteOrders.filter((item) => item.status === "refunded");

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

        {/* Local Cart */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Current Order (Unconfirmed)</h2>
          {localCart.length === 0 ? (
            <p className="text-gray-500">No items added yet.</p>
          ) : (
            <ul className="space-y-4">
              {localCart.map((item, index) => (
                <li key={index} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>

                      <p className="font-bold">{item.product_name}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Total: ${item.total_price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleLocalUpdate(item.product_id, parseInt(e.target.value))
                        }
                        className="w-16 border p-1"
                      />
                      <button
                        onClick={() => handleLocalDelete(item.product_id)}
                        className="underline text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {localCart.length > 0 && (
            <button
              onClick={handlePurchase}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Purchase All
            </button>
          )}
        </section>

        {/* Supabase Cart - Pending */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
          {pending.length === 0 ? (
            <p className="text-gray-500">No pending orders.</p>
          ) : (
            <ul className="space-y-4">
              {pending.map((item) => (
                <li key={item.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.product_name}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Total: ${item.total_price.toFixed(2)}</p>
                      <p>Status: {item.status}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Supabase Cart - Purchased */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Purchased Orders</h2>
          {purchased.length === 0 ? (
            <p className="text-gray-500">No purchases yet.</p>
          ) : (
            <ul className="space-y-4">
              {purchased.map((item) => (
                <li key={item.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.product_name}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Total: ${item.total_price.toFixed(2)}</p>
                      <p>Status: {item.status}</p>
                    </div>
                    <button
                      onClick={() => item.id && handleRefund(item.id)}
                      className="underline text-yellow-600"
                    >
                      Refund
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Supabase Cart - Refunded */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Refunded Orders</h2>
          {refunded.length === 0 ? (
            <p className="text-gray-500">No refunds processed.</p>
          ) : (
            <ul className="space-y-4">
              {refunded.map((item) => (
                <li key={item.id} className="border p-4 rounded shadow-sm">
                  <div>
                    <p className="font-bold">{item.product_name}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Total: ${item.total_price.toFixed(2)}</p>
                    <p>Status: {item.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}