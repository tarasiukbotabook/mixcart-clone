"use client";

export default function RestaurantOrders() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-600 mt-2">Управление вашими заказами</p>
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Номер заказа
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Поставщик
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Нет заказов. Начните с просмотра каталога товаров.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
