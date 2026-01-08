"use client";

export default function RestaurantAnalytics() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-gray-600 mt-2">Статистика и отчеты</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Сегодня
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition">
          Неделя
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition">
          Месяц
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition">
          Год
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Всего расходов</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0 ₽</p>
          <p className="text-xs text-gray-500 mt-2">↑ 0% от прошлого периода</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Среднее за заказ</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0 ₽</p>
          <p className="text-xs text-gray-500 mt-2">↑ 0% от прошлого периода</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Количество заказов</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-xs text-gray-500 mt-2">↑ 0% от прошлого периода</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Активные поставщики</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-xs text-gray-500 mt-2">↑ 0% от прошлого периода</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Расходы по дням
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">График будет отображаться здесь</p>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Топ поставщиков
          </h3>
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-8">
              Нет данных для отображения
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Расходы по категориям
        </h3>
        <div className="space-y-4">
          <p className="text-gray-500 text-center py-8">
            Нет данных для отображения
          </p>
        </div>
      </div>
    </div>
  );
}
