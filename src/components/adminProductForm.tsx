'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { insertProduct, updateProduct } from '../app/lib/productService';
import { Product } from '../app/types/product';

type Props = {
  initialValues?: Product | null;
  onDone?: () => void;
};

export default function AdminProductForm({ initialValues, onDone }: Props) {
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: '',
    image_url: '',
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name,
        description: initialValues.description,
        price: initialValues.price.toString(),
        stock: initialValues.stock.toString(),
        categories: Array.isArray(initialValues.categories)
          ? initialValues.categories.join(', ')
          : (initialValues.categories ?? ''),
        image_url: initialValues.image_url ?? '',
      });
    }
  }, [initialValues]);

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      categories: form.categories.split(',').map((cat) => cat.trim()),
    };

    try {
      if (initialValues?.id) {
        // update existing product
        await updateProduct(initialValues.id, payload);
      } else {
        // create new product with created_by
        const createdBy = session?.user?.name;
        if (!createdBy) throw new Error('User session is not available');

        await insertProduct({
          ...payload,
          created_by: createdBy,
        });
      }

      if (onDone) onDone();
    } catch (err) {
      console.error('Failed to save product', err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-100 p-4 rounded">
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        name="price"
        placeholder="Price"
        type="number"
        step="0.01"
        value={form.price}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        name="stock"
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        name="categories"
        placeholder="Categories (comma-separated)"
        value={form.categories}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        name="image_url"
        placeholder="Image URL"
        value={form.image_url}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {initialValues ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}