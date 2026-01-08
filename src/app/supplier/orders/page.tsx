"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

export default function SupplierOrders() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const orders = useQuery(api.orders.getBySupplier, user ? { supplierId: user._id as any } : "skip");

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
    }
  }, [currentUser, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидание";
      case "confirmed":
        return "Подтверждено";
      case "shipped":
        return "Доставляется";
      case "delivered":
        return "Завершено";
      case "cancelled":
        return "Отменено";
      default:
        return status;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-600 mt-2">Управление заказами от ресторанов</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Таблица
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Карточки
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Все</option>
              <option>Ожидание</option>
              <option>Подтверждено</option>
              <option>Доставляется</option>
              <option>Завершено</option>
              <option>Отменено</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Период
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Все время</option>
              <option>Сегодня</option>
              <option>Неделя</option>
              <option>Месяц</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Номер заказа..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              Поиск
            </button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      {viewMode === "table" ? (
        // Table View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Номер заказа
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Ресторан
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Товары
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr 
                    key={order._id} 
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/supplier/orders/${order._id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      №{order.orderNumber || order._id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.restaurant?.name || "Неизвестно"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} товар(ов)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {order.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0).toFixed(2)} сўм
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Нет заказов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View (Cards)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders && orders.length > 0 ? (
            orders.map((order: any) => (
              <div 
                key={order._id} 
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/supplier/orders/${order._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Заказ №{order.orderNumber || order._id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      От: {order.restaurant?.name || "Неизвестно"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Товары:</p>
                  {order.items.map((item: any) => (
                    <div key={item.productId} className="text-sm text-gray-900">
                      • {item.product?.name || "Товар"} - {item.quantity} кг
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {order.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0).toFixed(2)} сўм
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Нет заказов</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
