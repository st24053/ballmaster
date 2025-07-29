export type Product = {
  id?: string; // Optional if Supabase auto-generates it
  name: string;
  description: string;
  price: number;
  stock: number;
  current_stock: number; // Current stock available
  image_url: string;
  categories: string[];
  created_at?: string; // optional if Supabase handles timestamps
  created_by: string;
};