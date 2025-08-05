"use client";

import { getProductById } from "@/app/lib/productService";
import { notFound } from "next/navigation";
import Image from "next/image";
import { addToLocalCart } from "@/app/lib/cartService";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/NavBar";
import React from "react";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function ProductPageWrapper({ params }: Props) {
    const { id } = React.use(params);
    return <ProductPageContent id={id} />;
}

function ProductPageContent({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const { data: session } = useSession();

  useState(() => {
    getProductById(id).then((data) => {
      if (!data) return notFound();
      setProduct(data);
    });
  });

  if (!product) return <p className="p-4">Loading product...</p>;

  const totalPrice = (quantity * product.price).toFixed(2);

  const handleAddToLocalCart = async () => {
    if (!session?.user) {
      setStatus("You must be logged in.");
      return;
    }

    try {
      await addToLocalCart({
        product_id: product.id,
        product_name: product.name,
        user_email: session.user.email,
        quantity,
        total_price: quantity * product.price,
        customer_name: session.user.name || "Anonymous",
        image_url: product.image_url || "",
        status: "pending",
      });
      setStatus("Item added to cart!");
    } catch (error: any) {
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <div>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-1/2 h-[400px]">
          <Image
            src={
              product.image_url?.startsWith("http") || product.image_url?.startsWith("/")
                ? product.image_url
                : "/placeholder.png"
            }
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl text-gray-700 mb-2">${product.price}</p>
          <p className="text-gray-600">Stock: {product.current_stock} / {product.stock}</p>
          <p className="text-sm text-gray-500 mb-2">
            Categories: {Array.isArray(product.categories) ? product.categories.join(", ") : product.categories}
          </p>
          <p className="text-gray-800">{product.description}</p>
          {product.created_by && (
            <p className="mt-4 text-sm text-gray-400">Posted by: {product.created_by}</p>
          )}

          {/* Quantity and Cart Actions */}
          <div className="mt-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-600">Quantity</label>
            <input
              type="number"
              value={quantity}
              min={1}
              max={product.current_stock}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border px-3 py-1 rounded w-20"
            />

            <p className="text-md mt-2">
              Total Price: <span className="font-semibold">${totalPrice}</span>
            </p>

            <button
            onClick={handleAddToLocalCart}
            disabled={!Number.isInteger(quantity) || quantity < 1 || quantity > product.current_stock}
            className={`mt-2 px-4 py-2 rounded text-white ${
                !Number.isInteger(quantity) || quantity < 1 || quantity > product.current_stock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            >
            Add to Cart
            </button>

            {status && <p className="text-sm mt-2 text-green-600">{status}</p>}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}