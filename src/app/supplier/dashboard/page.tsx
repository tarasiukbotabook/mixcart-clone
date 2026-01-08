"use client";

import Link from "next/link";

export default function SupplierDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Главное</h1>
        <p className="text-gray-600 mt-2">Обзор вашего магазина</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего товаров</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего заказов</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Общий доход</p>
              <p className="text-3xl font-bold text-green-600 mt-2">0 сўм</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Active Restaurants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Активные рестораны</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="text-4xl">🍽️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📦 Мои товары</h3>
          <p className="text-blue-700 mb-4">
            Управляйте вашим каталогом товаров
          </p>
          <Link
            href="/supplier/products"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Перейти к товарам
          </Link>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-2">📋 Заказы</h3>
          <p className="text-green-700 mb-4">
            Просмотрите заказы от ресторанов
          </p>
          <button className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Скоро доступно
          </button>
        </div>
      </div>
    </div>
  );
}
