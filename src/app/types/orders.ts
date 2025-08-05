export type Order = {
  id?: string; // Optional if Supabase auto-generates it
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  user_email: string;
  customer_name: string;
  status: 'pending' | 'completed' | 'refunded'; // restrict to valid statuses
  created_at?: string; // optional if Supabase handles timestamps
  image_url: string;
};