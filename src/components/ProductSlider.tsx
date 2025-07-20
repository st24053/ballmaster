'use client';

import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const products = [
  {
    title: "Ball 1",
    description: "by the Enviro Council",
    image: "/images/logo.png",
  },
  {
    title: "Ball 2",
    description: "Description of Ball 2.",
    image: "/images/logo.png",
  },
  {
    title: "Ball 3",
    description: "Description of Ball 3.",
    image: "/images/logo.png",
  },
  {
    title: "Ball 4",
    description: "Description of Ball 4.",
    image: "/images/logo.png",
  },
];

export function ProductSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 }},
      { breakpoint: 640, settings: { slidesToShow: 1 }},
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <Slider {...settings}>
        {products.map((product, index) => (
          <div key={index} className="bg-white p-4 rounded shadow mx-2">
            <Image
              src={product.image}
              alt={product.title}
              width={300}
              height={200}
              className="rounded"
            />
            <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}