'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { insertProduct, updateProduct } from '../app/lib/productService';
import { Product } from '../app/types/product';
import { supabase } from '../app/lib/supabaseClient'; // Supabase client instance for storage and DB operations

// Initial form state shape with default empty values
const initialForm = {
  name: '',
  description: '',
  price: '',
  current_stock: '',
  stock: '',
  categories: [] as string[], // Categories as an array of strings
  image_url: ''
};

export default function AdminProductForm({ initialValues, onDoneAction }: {
  initialValues?: Product | null; // If passed, form will be initialized with this data for editing
  onDoneAction?: () => void; // Callback when form submission is complete
}) {
  const { data: session } = useSession(); // Get logged-in user session

  // Form state holds all input values
  const [form, setForm] = useState(initialForm);
  // State for new category input field before adding
  const [newCategory, setNewCategory] = useState('');
  // State to hold selected image file before upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Loading state while submitting form
  const [loading, setLoading] = useState(false);
  // Local URL to show image preview when user selects an image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // On component mount or when initialValues change, populate form for editing
  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name,
        description: initialValues.description,
        price: initialValues.price.toString(),
        current_stock: initialValues.current_stock.toString(),
        stock: initialValues.stock.toString(),
        // Ensure categories is an array even if stored as comma-separated string
        categories: Array.isArray(initialValues.categories)
          ? initialValues.categories
          : ((initialValues.categories ?? '') as string)
              .split(',')
              .map((c: string) => c.trim()),
        image_url: initialValues.image_url ?? '',
      });
    }
  }, [initialValues]);

  // Generic input change handler for text and textarea fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new category to the categories array if not empty or duplicate
  const handleAddCategory = () => {
    if (newCategory.trim() && !form.categories.includes(newCategory.trim())) {
      setForm((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory(''); // Clear input after adding
    }
  };

  // Remove a category from the categories array
  const handleRemoveCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  // Handle user selecting an image file for upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow JPEG or JPG images
    if (
      !['image/jpeg', 'image/jpg'].includes(file.type.toLowerCase())
    ) {
      alert('Only JPG or JPEG images are allowed');
      return;
    }

    try {
      // Here you could add resizing/compression if needed
      const resizedBlob = file;
      setImageFile(file); // Save original file for upload
      setPreviewUrl(URL.createObjectURL(resizedBlob)); // Generate preview URL
    } catch (err) {
      console.error('Image processing failed:', err);
    }
  };

  // Upload the image file to Supabase storage and return the public URL
  const uploadImageToSupabase = async (file: File) => {
    const resizedBlob = await file;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`; // Unique filename
    const folder = "public"; // Folder in storage bucket, must match your policy
    const filePath = `${folder}/${fileName}`;

    // Upload file to 'product-images' bucket
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, resizedBlob, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    // Get publicly accessible URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  // Handle form submission (create or update product)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stock = parseInt(form.stock);
    const current_stock = parseInt(form.current_stock);

    // Validate that current stock is not more than max stock
    if (current_stock > stock) {
      alert("Stock cannot be greater than maximum stock.");
      setLoading(false);
      return;
    }

    let imageUrl = form.image_url;

    try {
      // Upload image if a new file was selected
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      // Prepare payload with proper number types
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        current_stock: parseInt(form.current_stock),
        image_url: imageUrl,
      };

      if (initialValues?.id) {
        // Update existing product
        await updateProduct(initialValues.id, payload);
      } else {
        // Create new product - require user session for created_by
        const createdBy = session?.user?.name;
        if (!createdBy) throw new Error('User session is not available');

        await insertProduct({
          ...payload,
          created_by: createdBy,
        });
      }

      // Call onDone callback if provided (e.g. to close form or refresh list)
      if (onDoneAction) onDoneAction();
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product. See console for details.');
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

      {/* Categories section */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Categories</label>
        <div className="flex gap-2 mb-2">
          {/* Input to add new category */}
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

        {/* Display added categories with remove buttons */}
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

      {/* Image upload section */}
      <div className="mb-4">
        <label className="block font-semibold mb-1 text-gray-700">Upload Image</label>
        
        <div className="flex items-center gap-3">
          {/* Custom file input label */}
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
        
        {/* Hidden actual file input */}
        <input
          id="file-upload"
          type="file"
          accept="image/jpeg"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Preview selected image */}
        {previewUrl && (
          <div className="mt-3">
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded shadow" />
          </div>
        )}
      </div>

      {/* Submit button disables while loading */}
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
