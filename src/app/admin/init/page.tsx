"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function InitPage() {
  const [loading, setLoading] = useState(false);
  const initializeCategories = useMutation(api.categories.initializeCategories);

  const handleInit = async () => {
    setLoading(true);
    try {
      const result = await initializeCategories({});
      toast.success(`Категории успешно добавлены! (${result.length} категорий)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при добавлении категорий");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Инициализация базы данных</h1>
        <p className="text-gray-600 mb-6">
          Нажмите кнопку ниже, чтобы добавить категории товаров в базу данных.
        </p>
        <button
          onClick={handleInit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Добавление..." : "Добавить категории"}
        </button>
      </div>
    </div>
  );
}
