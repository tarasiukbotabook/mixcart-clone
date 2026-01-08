"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const seedCategories = useMutation(api.seed.seedCategories);
  const seedTestData = useMutation(api.seed.seedTestData);

  const handleSeedCategories = async () => {
    setLoading(true);
    try {
      const result = await seedCategories({});
      toast.success("Категории успешно добавлены!");
      setResult(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при добавлении категорий");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTestData = async () => {
    setLoading(true);
    try {
      const result = await seedTestData({});
      toast.success("Тестовые данные успешно добавлены!");
      setResult(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при добавлении тестовых данных");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Инициализация базы данных</h1>
          <p className="text-gray-600 mb-8">Добавьте тестовые данные для разработки</p>

          <div className="space-y-4 mb-8">
            <button
              onClick={handleSeedCategories}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Загрузка..." : "1. Добавить категории"}
            </button>

            <button
              onClick={handleSeedTestData}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? "Загрузка..." : "2. Добавить тестовые данные"}
            </button>
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h2 className="font-semibold text-green-900 mb-4">Результат:</h2>
              <pre className="text-sm text-green-800 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Тестовые учетные данные:</h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Поставщик:</strong></p>
              <p>Email: supplier@test.com</p>
              <p>Пароль: password123</p>
              
              <p className="mt-4"><strong>Ресторан:</strong></p>
              <p>Email: restaurant@test.com</p>
              <p>Пароль: password123</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/auth/login"
              className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Перейти к входу
            </Link>
            <Link
              href="/"
              className="flex-1 text-center bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
