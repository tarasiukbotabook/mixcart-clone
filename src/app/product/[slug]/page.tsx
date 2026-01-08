"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const product = useQuery(api.products.getBySlug, { slug: params.slug });

  if (product === undefined) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Mixcart
            </Link>
          </nav>
        </header>
        <div className="text-center py-12">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Mixcart
            </Link>
          </nav>
        </header>
        <div className="text-center py-12">
          <p className="text-gray-500">Товар не найден</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mixcart
          </Link>
          <div className="flex gap-4">
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
              Каталог
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-blue-600">
              Корзина
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/catalog" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Вернуться в каталог
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg p-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded">
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {product.price} ₽
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through ml-4">
                  {product.originalPrice} ₽
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  ✓ В наличии ({product.stock} шт.)
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  ✗ Нет в наличии
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Количество:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  −
                </button>
                <span className="text-xl font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Добавить в корзину
            </button>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Теги:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
