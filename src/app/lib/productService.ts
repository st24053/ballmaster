import { supabase } from './supabaseClient';
import { Product } from '../types/product';

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

export async function insertProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select();

  if (error) throw error;

  return data[0]; // inserted product
}