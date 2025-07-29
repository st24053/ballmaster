"use client";

import { Order } from "@/app/types/orders";

const LOCAL_CART_KEY = "localCart";

function loadLocalCart(): Omit<Order, "id" | "created_at">[] {
  if (typeof window === "undefined") return [];
  try {
    const json = localStorage.getItem(LOCAL_CART_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(cart: Omit<Order, "id" | "created_at">[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

let localCart = loadLocalCart();

export function addToLocalCart(order: Omit<Order, "id" | "created_at">) {
  localCart.push(order);
  saveLocalCart(localCart);
  return [...localCart];
}

export function getLocalCart() {
  localCart = loadLocalCart();
  return [...localCart];
}

export function updateLocalCartItem(product_id: string, quantity: number) {
  localCart = localCart.map((item) =>
    item.product_id === product_id ? { ...item, quantity } : item
  );
  saveLocalCart(localCart);
  return [...localCart];
}

export function deleteLocalCartItem(product_id: string) {
  localCart = localCart.filter((item) => item.product_id !== product_id);
  saveLocalCart(localCart);
  return [...localCart];
}

import { supabase } from "@/app/lib/supabaseClient";

export async function purchaseCart(user_email: string, customer_name: string) {
  const pendingOrders = localCart.map((item) => ({
    ...item,
    user_email,
    customer_name,
    status: "pending",
  }));

  const { data, error } = await supabase.from("orders").insert(pendingOrders);
  if (error) throw new Error(`Failed to purchase items: ${error.message}`);

  localCart = [];
  saveLocalCart(localCart);
  return data;
}

export async function refundOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", id)
    .select();

  if (error) throw new Error(`Failed to refund order: ${error.message}`);
  return data;
}