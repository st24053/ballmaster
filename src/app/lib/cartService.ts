"use client";

import { Order } from "@/app/types/orders";
import { supabase } from "@/app/lib/supabaseClient";
const LOCAL_CART_KEY = "localCart";

let localCart = loadLocalCart();

// Load the local cart from localStorage
function loadLocalCart(): Omit<Order, "id" | "created_at">[] {
  if (typeof window === "undefined") return [];
  try {
    const json = localStorage.getItem(LOCAL_CART_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

// Save the local cart to localStorage
function saveLocalCart(cart: Omit<Order, "id" | "created_at">[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

// Add an item to the local cart with an ID and created_at
export function addToLocalCart(order: Omit<Order, "id" | "created_at">) {
  localCart.push(order);
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
  localCart = localCart.map((item) =>
    item.product_id === product_id ? { ...item, quantity } : item
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
    alert(pendingOrders)
    return;
  }

  // Clear cart
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