"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

export default function MigrationPage() {
  const [status, setStatus] = useState("idle");
  const migrate = useMutation(api.products.migrateSupplierNames);

  const handleMigrate = async () => {
    setStatus("migrating");

    try {
      const result = await migrate({});
      toast.success(result.message);
      setStatus("idle");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при миграции");
      setStatus("idle");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Оптимизация товаров</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Эта страница оптимизирует товары, добавляя имена поставщиков для быстрого доступа. Это ускорит загрузку каталога.
        </p>

        <button
          onClick={handleMigrate}
          disabled={status === "migrating"}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {status === "migrating" ? "Оптимизация в процессе..." : "Начать оптимизацию"}
        </button>
      </div>
    </div>
  );
}
