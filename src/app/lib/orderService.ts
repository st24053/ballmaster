import { supabase } from "./supabaseClient";
import { Order } from "../types/orders";

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function refundOrder(id: string) {
  const { error } = await supabase.from("orders").update({ status: "refunded" }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function confirmOrder(orderId: string) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("product_id, quantity")
    .eq("id", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("current_stock")
    .eq("id", order.product_id)
    .single();

  if (productError) throw new Error(productError.message);

  const newStock = product.current_stock - order.quantity;

  if (newStock < 0) {
    throw new Error("Insufficient stock to confirm order.");
  }

  const { error: updateProductError } = await supabase
    .from("products")
    .update({ current_stock: newStock })
    .eq("id", order.product_id);

  if (updateProductError) throw new Error(updateProductError.message);

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId);

  if (updateOrderError) throw new Error(updateOrderError.message);
}