import { supabase } from './supabaseClient';
import { Product } from '../types/product';
import { Order } from '../types/orders';


export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch product:', error.message);
    return null;
  }

  return data;
}

// Upload an image to Supabase Storage and return the public URL
export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Insert a new product into the 'products' table
export async function insertProduct(product: Product) {
  const { current_stock, ...rest } = product;

  const { error } = await supabase.from("products").insert([
    {
      ...rest,
      current_stock: product.stock, // Always start current_stock = stock
    },
  ]);

  if (error) throw new Error(error.message);
}

// Fetch all products from the 'products' table
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    return [];
  }

  return data;
}

// Delete a product by ID from the 'products' table
export async function discontinueProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Failed to delete product with id ${id}:`, error.message);
    throw error;
  }
}
// Update an existing product by ID
export async function updateProduct(id: string, updates: Partial<Product>) {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function placeOrder(order: Order) {
  const { data, error } = await supabase.from('orders').insert([order]);
  if (error) throw error;
  return data;
}