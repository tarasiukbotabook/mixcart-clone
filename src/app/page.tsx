"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch current user if token exists
  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const logout = useMutation(api.auth.logout);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
    setMounted(true);
  }, []);

  // Update user when currentUser changes
  useEffect(() => {
    if (mounted && token) {
      if (currentUser !== undefined) {
        if (currentUser) {
          setUser(currentUser as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    } else if (mounted && !token) {
      setUser(null);
      setLoading(false);
    }
  }, [currentUser, token, mounted]);

  const handleLogout = async () => {
    if (token) {
      try {
        await logout({ token });
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; max-age=0";
        setToken(null);
        setUser(null);
        toast.success("Вы вышли из аккаунта");
      } catch (error) {
        toast.error("Ошибка при выходе");
      }
    }
  };

  if (!mounted || loading) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Mixcart</div>
          <div className="flex gap-4 items-center">
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
              Каталог
            </Link>
            {!user ? (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                  Вход
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Личный кабинет
                </Link>
                <span className="text-gray-600 text-sm">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Выход
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {user ? (
            <>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Добро пожаловать, {user.name}!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {user.type === "restaurant" ? "🍽️ Вы авторизованы как ресторан" : "📦 Вы авторизованы как поставщик"}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Перейти в личный кабинет
                </Link>
                <Link
                  href="/catalog"
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
                >
                  Просмотреть каталог
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Добро пожаловать в Mixcart
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Платформа для ресторанов и поставщиков
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Начать
                </Link>
                <Link
                  href="/catalog"
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
                >
                  Просмотреть каталог
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Для кого это?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Restaurants */}
            <div className="p-8 border-2 border-blue-200 rounded-lg">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold mb-4">Для ресторанов</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Просмотр товаров от поставщиков</li>
                <li>✓ Быстрое размещение заказов</li>
                <li>✓ Отслеживание доставки</li>
                <li>✓ История заказов и счетов</li>
              </ul>
              <Link
                href="/auth/register"
                className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Зарегистрироваться как ресторан
              </Link>
            </div>

            {/* For Suppliers */}
            <div className="p-8 border-2 border-green-200 rounded-lg">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-4">Для поставщиков</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Размещение своих товаров</li>
                <li>✓ Управление каталогом</li>
                <li>✓ Получение заказов от ресторанов</li>
                <li>✓ Аналитика продаж</li>
              </ul>
              <Link
                href="/auth/register"
                className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Зарегистрироваться как поставщик
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">
                Доставляем товары по всей стране за 1-3 дня
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Лучшие цены</h3>
              <p className="text-gray-600">
                Гарантируем самые конкурентные цены на рынке
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Качество</h3>
              <p className="text-gray-600">
                Все товары проверены и сертифицированы
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
