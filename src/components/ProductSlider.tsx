"use client";

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { useEffect, useState } from "react";
import { getProducts } from "@/app/lib/productService";
import { Product } from "../app/types/product";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ProductSlider component to display products in a slider format
export function ProductSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const allCategories = Array.from(new Set(
    products.flatMap(p =>
      Array.isArray(p.categories)
        ? p.categories
        : typeof p.categories === "string"
          ? p.categories.split(",").map((cat: string) => cat.trim())
          : []
    )
  ));

  // Filter products based on search term and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (Array.isArray(product.categories)
        ? product.categories.includes(selectedCategory)
        : product.categories?.includes(selectedCategory));
    return product.current_stock > 0 && matchesSearch && matchesCategory;
  });

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(3, filteredProducts.length),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ]
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/3"
        >
          <option value="All">All Categories</option>
          {allCategories.map((category, idx) => (
            <option key={idx} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products available.</p>
      ) : filteredProducts.length === 1 ? (
        // Just render the single product without Slider
        <SingleProductCard product={filteredProducts[0]} />
      ) : (
        // Render Slider
        <Slider {...settings}>
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <SingleProductCard product={product} />
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}

// SingleProductCard component if there's only one product to display
function SingleProductCard({ product }: { product: Product }) {
  const categories = Array.isArray(product.categories)
    ? product.categories
    : typeof product.categories === "string"
      ? product.categories.split(",")
      : [];

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white p-4 rounded shadow mx-2 relative group cursor-pointer">
        <div className="relative w-full h-[200px]">
          {/* Ensure image URL is valid */}
          <Image
            src={
              product.image_url?.startsWith("http") || product.image_url?.startsWith("/")
                ? product.image_url
                : "/placeholder.png"
            }
            alt={product.name}
            fill
            className="rounded object-cover"
          />
        {/* Overlay for product description, name, price and stock*/}
          <div className="absolute inset-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
            <p className="text-sm">{product.description}</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
        <p className="text-gray-800 font-medium">${product.price}</p>
        <p className="text-gray-600">Stock: {product.current_stock} / {product.stock}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {categories.map((cat, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {cat.trim()}
            </span>
          ))}
        </div>
        {product.created_by && (
          <p className="text-sm text-gray-400 mt-1">Posted by: {product.created_by}</p>
        )}
      </div>
    </Link>
  );
}
