'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { insertProduct, updateProduct } from '../app/lib/productService';
import { Product } from '../app/types/product';
import { supabase } from '../app/lib/supabaseClient'; // Make sure this is set up

const initialForm = {
  name: '',
  description: '',
  price: '',
  current_stock: '',
  stock: '',
  categories: [],
  image_url: ''
};

export default function AdminProductForm({ initialValues, onDone }: {

  initialValues?: Product | null;
  onDone?: () => void;
}) {

  const { data: session } = useSession(); // Get the current user session
  const [form, setForm] = useState(initialForm); // Initial form state
  const [newCategory, setNewCategory] = useState(''); // New category input state
  const [imageFile, setImageFile] = useState<File | null>(null); // File state for image upload
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Image preview URL

  

  useEffect(() => { // Populate form with initial values if provided
    if (initialValues) { // Check if initialValues is not null
      setForm({ // Set form state with initial values
        name: initialValues.name,
        description: initialValues.description,
        price: initialValues.price.toString(),
        current_stock: initialValues.current_stock.toString(),
        stock: initialValues.stock.toString(),
        categories: Array.isArray(initialValues.categories)
          ? initialValues.categories
          : (initialValues.categories ?? '').split(',').map((c) => c.trim()),
        image_url: initialValues.image_url ?? '',
      });
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !form.categories.includes(newCategory.trim())) {
      setForm((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a JPEG
    if (
      !['image/jpeg', 'image/jpg'].includes(file.type.toLowerCase())
    ) {
      alert('Only JPG or JPEG images are allowed');
      return;
    }

    try {
      const resizedBlob = file;
      setImageFile(file); // Save original for naming
      setPreviewUrl(URL.createObjectURL(resizedBlob));
    } catch (err) {
      console.error('Image processing failed:', err);
    }
  };
  
const uploadImageToSupabase = async (file: File) => {
  const resizedBlob = await file;
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const folder = "public";
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, resizedBlob, {
      contentType: 'image/jpeg',
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stock = parseInt(form.stock);
    const current_stock = parseInt(form.current_stock);

    if (current_stock > stock) {
      alert("Stock cannot be greater than maximum stock.");
      return;
    }

    let imageUrl = form.image_url;

    try {
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        current_stock: parseInt(form.current_stock),
        image_url: imageUrl,
      };

      if (initialValues?.id) {
        await updateProduct(initialValues.id, payload);
      } else {
        const createdBy = session?.user?.name;
        if (!createdBy) throw new Error('User session is not available');

        await insertProduct({
          ...payload,
          created_by: createdBy,
          current_stock: payload.current_stock,
          stock: payload.stock,
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
    <label className="block font-semibold mb-1">Name of Product</label>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <label className="block font-semibold mb-1">Description of Product</label>
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <label className="block font-semibold mb-1">Price of Product</label>
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
      <label className="block font-semibold mb-1">Current Stock of Product</label>
      <input
        name="current_stock"
        placeholder="Current Stock"
        type="number"
        value={form.current_stock}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <label className="block font-semibold mb-1">Maximum Stock of Product</label>
      <input
        name="stock"
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
        required
      />

      <div className="mb-4">
        <label className="block font-semibold mb-1">Categories</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Add category"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-3 rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.categories.map((cat) => (
            <span
              key={cat}
              className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {cat}
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1 text-gray-700">Upload Image</label>
        
        <div className="flex items-center gap-3">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Choose JPG File
          </label>
          <span className="text-sm text-gray-600">
            {imageFile ? imageFile.name : 'No file selected'}
          </span>
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept="image/jpeg"
          onChange={handleImageChange}
          className="hidden"
        />

        {previewUrl && (
          <div className="mt-3">
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded shadow" />
          </div>
        )}
      </div>

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