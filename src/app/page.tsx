"use client";

import NavBar from "../components/NavBar";
import { ProductSlider } from "../components/ProductSlider";

// Home page component
export default function Home() {
  return (
    <>
     <NavBar />
     {/* Main content area */}
      <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <ProductSlider />
      <footer className="text-center text-sm text-gray-500 py-4">
        © Ballmaster. All rights reserved.
        Images for products may be user generated. Please report any issues to the site admin. <br></br>
        <button
          onClick={() => {
            navigator.clipboard.writeText("kaylen.soong@gmail.com");
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
              "kaylen.soong@gmail.com"
            )}&su=${encodeURIComponent("Regarding product image issues")}&body=${encodeURIComponent(
              `Hi ${"Kaylen Soong, "},\n\n`
            )}`;
            window.open(gmailUrl, "_blank");
          }}
          className="text-blue-600 hover:underline"
        >
          {"kaylen.soong@gmail.com"}
        </button>
      </footer>
    </main>
    </>
  );
}