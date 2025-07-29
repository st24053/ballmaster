'use client';

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { useEffect, useState } from "react";
import { getProducts } from "@/app/lib/productService";
import { Product } from '../app/types/product';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function ProductSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [slidesToShow, setSlidesToShow] = useState<number>(3);

  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
      setSlidesToShow(Math.min(3, data.length));
    }
    fetchProducts();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 }},
      { breakpoint: 640, settings: { slidesToShow: 1 }},
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <Slider {...settings}>
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <div className="bg-white p-4 rounded shadow mx-2 relative group cursor-pointer">
              <div className="relative w-full h-[200px]">
                <Image
                  src={
                    product.image_url?.startsWith('http') || product.image_url?.startsWith('/')
                      ? product.image_url
                      : '/placeholder.png'
                  }
                  alt={product.name}
                  fill
                  className="rounded object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                  <p className="text-sm">{product.description}</p>
                </div>
              </div>
              <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
              <p className="text-gray-800 font-medium">${product.price}</p>
              <p className="text-gray-600">Stock: {product.current_stock} / {product.stock}</p>
              <p className="text-sm text-gray-500">
                Categories: {Array.isArray(product.categories) ? product.categories.join(', ') : product.categories}
              </p>
              {product.created_by && (
                <p className="text-sm text-gray-400">Posted by: {product.created_by}</p>
              )}
            </div>
          </Link>
        ))}
      </Slider>
    </div>
  );
}