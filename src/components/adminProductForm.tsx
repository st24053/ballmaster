import { useState } from 'react';
import { insertProduct } from '../app/lib/productService';
import { useSession } from 'next-auth/react';

export default function AdminProductForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: '',
    image_url: '',    // <-- added image_url field here
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) return alert("Please enter an image URL.");

    setLoading(true);
    try {
      const product = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image_url: form.image_url,
        categories: form.categories.split(',').map(c => c.trim()),
        user_id: session.user.email,
      };
      await insertProduct(product);
      alert("Product created successfully!");
      setForm({ name: '', description: '', price: '', stock: '', categories: '', image_url: '' });
    } catch (err: any) {
      alert("Error creating product: " + err.message);
      console.error("Full error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded-xl">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        required
        className="w-full border px-3 py-2"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        required
        className="w-full border px-3 py-2"
      />
      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        required
        type="number"
        step="0.01"
        className="w-full border px-3 py-2"
      />
      <input
        name="stock"
        value={form.stock}
        onChange={handleChange}
        placeholder="Stock"
        required
        type="number"
        className="w-full border px-3 py-2"
      />
      <input
        name="categories"
        value={form.categories}
        onChange={handleChange}
        placeholder="Comma-separated tags"
        required
        className="w-full border px-3 py-2"
      />
      <input
        name="image_url"
        value={form.image_url}
        onChange={handleChange}
        placeholder="Image URL"
        required
        type="url"
        className="w-full border px-3 py-2"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}