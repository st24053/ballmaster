export type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  categories: string[];
  created_at?: string;
};