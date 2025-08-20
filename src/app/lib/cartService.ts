"use client";

import { Order } from "@/app/types/orders";
import { supabase } from "@/app/lib/supabaseClient";

const LOCAL_CART_KEY = "localCart";

// Local cart items must include price for recalculation
export type LocalCartItem = Omit<Order, "id" | "created_at"> & {
  price: number; // unit price
};

let localCart: LocalCartItem[] = loadLocalCart();

// Load the local cart from localStorage
function loadLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const json = localStorage.getItem(LOCAL_CART_KEY);
    const items: LocalCartItem[] = json ? JSON.parse(json) : [];
    // Ensure total_price is always valid
    return items.map((item) => ({
      ...item,
      total_price: item.price * item.quantity,
    }));
  } catch {
    return [];
  }
}

// Save the local cart to localStorage
function saveLocalCart(cart: LocalCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

// Add an item to the local cart
export function addToLocalCart(order: Omit<Order, "id" | "created_at">) {
  const quantity = Number.isFinite(order.quantity) ? order.quantity : 1;
  const total_price = order.price * quantity;
  localCart.push({ ...order, quantity, total_price });
  saveLocalCart(localCart);
  return [...localCart];
}

// Fetch the local cart
export function getLocalCart() {
  localCart = loadLocalCart();
  return [...localCart];
}

// Update an item in the local cart by product ID
export function updateLocalCartItem(product_id: string, quantity: number) {
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  localCart = localCart.map((item) =>
    item.product_id === product_id
      ? { ...item, quantity: safeQty, total_price: item.price * safeQty }
      : item
  );
  saveLocalCart(localCart);
  return [...localCart];
}

// Delete an item from the local cart by product ID
export function deleteLocalCartItem(product_id: string) {
  localCart = localCart.filter((item) => item.product_id !== product_id);
  saveLocalCart(localCart);
  return [...localCart];
}

// Purchase items in the local cart
export async function purchaseCart(user_email: string, customer_name: string) {
  if (localCart.length === 0) return;

  // Get unique product IDs
  const productIds = [...new Set(localCart.map((item) => item.product_id))];

  // Fetch products from DB
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, current_stock")
    .in("id", productIds);

  if (productsError) {
    alert(`Failed to fetch products: ${productsError.message}`);
    return;
  }

  // Stock check
  for (const item of localCart) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      alert(`Product not found (ID: ${item.product_id})`);
      return;
    }
    if (product.current_stock < item.quantity) {
      alert(
        `Insufficient stock for "${product.name}". Available: ${product.current_stock}, Requested: ${item.quantity}`
      );
      return;
    }
  }

  // Always recalc totals before inserting
  const pendingOrders = localCart.map((item) => ({
    ...item,
    user_email,
    customer_name,
    total_price: item.price * item.quantity,
    status: "pending",
  }));

  const { error } = await supabase.from("orders").insert(pendingOrders);
  if (error) {
    alert(`Failed to purchase items: ${error.message}`);
    return;
  }

  // Clear local cart
  localCart = [];
  saveLocalCart(localCart);

  alert("Purchase successful!");
}

// Refund an order by ID
export async function refundOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", id)
    .select();

  if (error) throw new Error(`Failed to refund order: ${error.message}`);
  return data;
}
