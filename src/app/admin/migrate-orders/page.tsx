"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

export default function MigrateOrdersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const migrateOrderNumbers = useMutation(api.orders.migrateOrderNumbers);

  const handleMigrate = async () => {
    setIsLoading(true);
    try {
      const result = await migrateOrderNumbers({});
      toast.success(`Миграция завершена! Обновлено заказов: ${result.migratedCount}, максимальный номер: ${result.maxOrderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при миграции");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Миграция номеров заказов</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Эта страница присваивает порядковые номера всем существующим заказам, которые их не имеют.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Что будет сделано:</strong>
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
              <li>Все заказы будут отсортированы по дате создания</li>
              <li>Каждому заказу будет присвоен порядковый номер (1, 2, 3...)</li>
              <li>Заказы, которые уже имеют номер, не будут изменены</li>
            </ul>
          </div>

          <button
            onClick={handleMigrate}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
          >
            {isLoading ? "Выполняется миграция..." : "Запустить миграцию"}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-sm text-gray-600">
            После завершения миграции все заказы будут иметь красивые порядковые номера вместо непонятных символов.
          </p>
        </div>
      </div>
    </div>
  );
}
