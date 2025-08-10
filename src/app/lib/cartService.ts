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
  if (localCart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Get unique product IDs from the cart
  const productIds = [...new Set(localCart.map(item => item.product_id))];

  // Fetch all products in one query
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, current_stock")
    .in("id", productIds);

  if (productsError) {
    alert(`Failed to fetch products: ${productsError.message}`);
    return;
  }

  // Check stock for each cart item
  for (const item of localCart) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) {
      alert(`Product not found (ID: ${item.product_id})`);
      return;
    }
    if (product.current_stock < item.quantity) {
      alert(`Insufficient stock for "${product.name}". Available: ${product.current_stock}, Requested: ${item.quantity}`);
      return;
    }
  }

  // If all stock checks pass, insert orders
  const pendingOrders = localCart.map((item) => ({
    ...item,
    user_email,
    customer_name,
    status: "pending",
  }));

  const { error } = await supabase.from("orders").insert(pendingOrders);
  if (error) {
    alert(`Failed to purchase items: ${error.message}`);
    return;
  }

  // Clear cart
  localCart = [];
  saveLocalCart(localCart);

  alert("Purchase successful!");
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