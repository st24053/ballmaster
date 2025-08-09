export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  current_stock: number;
  stock: number;
  categories: string | string[] | null; // explicitly allow string or string[] or null
  image_url?: string;
  created_by?: string; // optional for fetched rows
};

// Type for inserting new products
export type NewProduct = Omit<Product, 'id'> & { created_by: string };