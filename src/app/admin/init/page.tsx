"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function InitPage() {
  const [loading, setLoading] = useState(false);
  const createCategory = useMutation(api.categories.create);

  const categories = [
    {
      name: "Овощи",
      slug: "vegetables",
      description: "Свежие овощи",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    },
    {
      name: "Фрукты",
      slug: "fruits",
      description: "Свежие фрукты",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    },
    {
      name: "Молочные продукты",
      slug: "dairy",
      description: "Молоко, сыр, йогурт",
      image: "https://images.unsplash.com/photo-1628185519336-c6fb5f1b912d?w=400",
    },
    {
      name: "Мясо и рыба",
      slug: "meat-fish",
      description: "Свежее мясо и рыба",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    },
    {
      name: "Хлеб и выпечка",
      slug: "bread-bakery",
      description: "Хлеб, булки, выпечка",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    },
    {
      name: "Специи и приправы",
      slug: "spices",
      description: "Специи и приправы",
      image: "https://images.unsplash.com/photo-1596040707382-e3e5e0f9e3e3?w=400",
    },
  ];

  const handleInit = async () => {
    setLoading(true);
    try {
      for (const category of categories) {
        await createCategory({
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
        });
      }
      toast.success("Категории успешно добавлены!");
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
