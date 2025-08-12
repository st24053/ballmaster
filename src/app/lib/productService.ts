import { supabase } from './supabaseClient';
import { Order } from '../types/orders';
import { Product, NewProduct } from "../types/product";

export async function getProductById(id: string, authorEmail?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('id', id);

  if (authorEmail) {
    query = query.eq('author_email', authorEmail);
  }

  const { data, error } = await query.single();

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
export async function insertProduct(product: NewProduct) {
  const { current_stock, ...rest } = product;
  const { error } = await supabase.from("products").insert([
    {
      ...rest,
      author_email: product.author_email, // store admin email
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

  // Step 1: Get the image path from the product row
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    throw new Error(`Failed to fetch product: ${fetchError?.message}`);
  }

  // Step 2: Extract storage path from full URL
  const imageUrl = product.image_url;
  const bucketName = "product-images"; // adjust this if your bucket name is different
  const pathMatch = imageUrl?.match(new RegExp(`${bucketName}/(.*)$`));
  const imagePath = pathMatch?.[1];

  if (imagePath) {
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([imagePath]);

    if (deleteError) {
      throw new Error(`Failed to delete image: ${deleteError.message}`);
    }
  }

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

// Fetch products by author_email for admin dashboard
export async function getProductsByAuthorEmail(email: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('author_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch products for this admin:', error.message);
    return [];
  }

  return data;
}