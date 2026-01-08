"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

export default function RestaurantCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch products
  const products = useQuery(api.products.list, {});
  const categories = useQuery(api.categories.list, {});
  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const addToCart = useMutation(api.cart.addToCart);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
    }
  }, [currentUser, token]);

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setQuantities({
      ...quantities,
      [productId]: Math.max(0, num),
    });
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Пожалуйста, авторизуйтесь");
      return;
    }

    const quantity = quantities[productId] || 0;
    if (quantity <= 0) {
      toast.error("Введите количество больше 0");
      return;
    }

    try {
      await addToCart({
        userId: user._id as any,
        productId: productId as any,
        quantity,
      });
      toast.success(`Товар добавлен в корзину (${quantity} кг)`);
      setQuantities({
        ...quantities,
        [productId]: 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при добавлении в корзину");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Каталог товаров</h1>
        <p className="text-gray-600 mt-2">Просмотр доступных товаров</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Название товара..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Очистить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const quantity = quantities[product._id] || 0;
            const totalPrice = quantity * product.price;

            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Supplier */}
                  <p className="text-sm text-gray-600 mb-3">
                    Поставщик: {product.supplierName || "Неизвестно"}
                  </p>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {product.price} сўм
                    </span>
                    <span className="text-xs text-gray-500 ml-2">за кг</span>
                  </div>

                  {/* Stock */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ В наличии ({product.stock} кг)
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">
                        ✗ Нет в наличии
                      </span>
                    )}
                  </div>

                  {/* Quantity Input and Total Price */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Количество (кг)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={quantity || ""}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {quantity > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          Итого: {totalPrice.toFixed(2)} сўм
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock <= 0}
                    className={`w-full py-2 rounded-lg transition font-medium ${
                      product.stock > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {product.stock > 0 ? "Добавить в корзину" : "Нет в наличии"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {products && products.length === 0
                ? "Товары не найдены"
                : "Загрузка товаров..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
