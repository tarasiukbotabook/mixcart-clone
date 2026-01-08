"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  restaurantName?: string;
  restaurantInn?: string;
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}

export default function RestaurantProfile() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantInn: "",
    phone: "",
  });

  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const updateProfile = useMutation(api.auth.updateRestaurantProfile);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      const userData = currentUser as User;
      setUser(userData);
      setFormData({
        restaurantName: userData.restaurantName || "",
        restaurantInn: userData.restaurantInn || "",
        phone: userData.phone || "",
      });
    }
  }, [currentUser, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Ошибка: пользователь не найден");
      return;
    }

    if (!formData.restaurantName.trim()) {
      toast.error("Введите название ресторана");
      return;
    }

    if (!formData.restaurantInn.trim()) {
      toast.error("Введите ИНН");
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        userId: user._id as any,
        restaurantName: formData.restaurantName,
        restaurantInn: formData.restaurantInn,
        phone: formData.phone,
      });

      toast.success("Профиль успешно обновлен!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Профиль ресторана</h1>
          <p className="text-gray-600 mt-2">Управление информацией о вашем ресторане</p>
        </div>
        <Link
          href="/restaurant/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Назад
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Название ресторана
                </label>
                <p className="text-gray-900">{user.restaurantName || "Не указано"}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ИНН
                </label>
                <p className="text-gray-900">{user.restaurantInn || "Не указано"}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Телефон
                </label>
                <p className="text-gray-900">{user.phone}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Редактировать профиль
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email (не изменяется)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Название ресторана *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Ресторан Вкусная еда"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  ИНН *
                </label>
                <input
                  type="text"
                  name="restaurantInn"
                  value={formData.restaurantInn}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 123456789012"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+7 (999) 999-99-99"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
