"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"restaurant" | "supplier">(
    "restaurant"
  );
  const [loading, setLoading] = useState(false);

  const registerRestaurant = useMutation(api.auth.registerRestaurant);
  const registerSupplier = useMutation(api.auth.registerSupplier);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (userType === "restaurant") {
        result = await registerRestaurant({
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
      } else {
        result = await registerSupplier({
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
      }

      // Сохранение токена
      localStorage.setItem("auth_token", result.token);
      document.cookie = `auth_token=${result.token}; path=/; max-age=${30 * 24 * 60 * 60}`;

      toast.success("Регистрация успешна!");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ошибка регистрации"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            HubFood
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
              Вход
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
          <p className="text-gray-600 mb-8">
            Создайте аккаунт для начала работы
          </p>

          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4">
              Выберите тип аккаунта:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUserType("restaurant")}
                className={`p-4 border-2 rounded-lg transition ${
                  userType === "restaurant"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">🍽️</div>
                <div className="font-semibold">Ресторан</div>
                <div className="text-sm text-gray-600">Покупатель</div>
              </button>
              <button
                onClick={() => setUserType("supplier")}
                className={`p-4 border-2 rounded-lg transition ${
                  userType === "supplier"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-semibold">Поставщик</div>
                <div className="text-sm text-gray-600">Продавец</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 999-99-99"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Уже есть аккаунт?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
