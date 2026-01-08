"use client";

import Link from "next/link";
import { TotalOrdersIcon, PendingOrdersIcon, CompletedOrdersIcon, MoneyIcon } from "@/components/Icons";

export default function RestaurantDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Главное</h1>
        <p className="text-gray-600 mt-2">Обзор вашего ресторана</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего заказов</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="text-gray-400">
              <TotalOrdersIcon />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ожидающих заказов</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
            </div>
            <div className="text-gray-400">
              <PendingOrdersIcon />
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Завершено заказов</p>
              <p className="text-3xl font-bold text-green-600 mt-2">0</p>
            </div>
            <div className="text-gray-400">
              <CompletedOrdersIcon />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Потрачено</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">0 сўм</p>
            </div>
            <div className="text-gray-400">
              <MoneyIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Последние заказы</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Нет заказов. Начните с просмотра каталога товаров.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Каталог</h3>
          <p className="text-blue-700 mb-4">
            Просмотрите доступные товары от поставщиков
          </p>
          <a
            href="/catalog"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Перейти в каталог
          </a>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-2">Корзина</h3>
          <p className="text-green-700 mb-4">
            Проверьте товары в вашей корзине
          </p>
          <a
            href="/cart"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Открыть корзину
          </a>
        </div>
      </div>
    </div>
  );
}
