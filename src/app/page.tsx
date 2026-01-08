import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Mixcart</div>
          <div className="flex gap-4">
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
              Каталог
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-blue-600">
              Корзина
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Добро пожаловать в Mixcart
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Лучший выбор товаров по доступным ценам
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Начать покупки
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
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
