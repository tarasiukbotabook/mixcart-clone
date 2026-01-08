"use client";

import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            HubFood
          </Link>
          <div className="flex gap-4">
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
              Каталог
            </Link>
            <Link href="/cart" className="text-blue-600 font-semibold">
              Корзина
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>

        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Корзина пуста</p>
          <Link
            href="/catalog"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </main>
  );
}
