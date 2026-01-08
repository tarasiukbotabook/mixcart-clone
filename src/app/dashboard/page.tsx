"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantCity?: string;
  restaurantPostalCode?: string;
  supplierName?: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierPostalCode?: string;
  supplierDescription?: string;
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Получение текущего пользователя
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token") || 
                       document.cookie.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];
    if (!storedToken) {
      router.push("/auth/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (currentUser !== undefined) {
      if (!currentUser) {
        localStorage.removeItem("auth_token");
        router.push("/auth/login");
      } else {
        setUser(currentUser as User);
      }
      setLoading(false);
    }
  }, [currentUser, router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    toast.success("Вы вышли из аккаунта");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isRestaurant = user.type === "restaurant";
  const isSupplier = user.type === "supplier";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mixcart
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Выход
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-600">
            {isRestaurant
              ? `Ресторан: ${user.restaurantName}`
              : `Компания: ${user.supplierName}`}
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">Профиль</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Имя</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Телефон</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Тип аккаунта</p>
                <p className="font-semibold">
                  {isRestaurant ? "🍽️ Ресторан" : "📦 Поставщик"}
                </p>
              </div>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">
              {isRestaurant ? "Информация о ресторане" : "Информация о компании"}
            </h2>
            <div className="space-y-3">
              {isRestaurant ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Название</p>
                    <p className="font-semibold">{user.restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Адрес</p>
                    <p className="font-semibold">{user.restaurantAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Город</p>
                    <p className="font-semibold">{user.restaurantCity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Почтовый индекс</p>
                    <p className="font-semibold">
                      {user.restaurantPostalCode}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Название</p>
                    <p className="font-semibold">{user.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Адрес</p>
                    <p className="font-semibold">{user.supplierAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Город</p>
                    <p className="font-semibold">{user.supplierCity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Почтовый индекс</p>
                    <p className="font-semibold">{user.supplierPostalCode}</p>
                  </div>
                  {user.supplierDescription && (
                    <div>
                      <p className="text-sm text-gray-600">Описание</p>
                      <p className="font-semibold">{user.supplierDescription}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isRestaurant ? (
              <>
                <Link
                  href="/catalog"
                  className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-center"
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="font-semibold">Каталог товаров</div>
                  <div className="text-sm text-gray-600">
                    Просмотреть доступные товары
                  </div>
                </Link>
                <Link
                  href="/orders"
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition text-center"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold">Мои заказы</div>
                  <div className="text-sm text-gray-600">
                    Просмотреть историю заказов
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/supplier/products"
                  className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-center"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold">Мои товары</div>
                  <div className="text-sm text-gray-600">
                    Управлять каталогом товаров
                  </div>
                </Link>
                <Link
                  href="/supplier/orders"
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold">Заказы</div>
                  <div className="text-sm text-gray-600">
                    Просмотреть полученные заказы
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
