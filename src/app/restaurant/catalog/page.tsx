"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { imageCache } from "@/utils/imageCache";
import { cartStore } from "@/utils/cartStore";
import CatalogCartSidebar from "@/components/CatalogCartSidebar";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  supplierId: string;
  supplierName?: string;
  active?: boolean;
}

export default function RestaurantCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [limit, setLimit] = useState(50);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fetch products with limit
  const queryArgs = {
    limit,
  } as any;
  
  if (selectedCategory) {
    queryArgs.categoryId = selectedCategory;
  }
  
  if (searchQuery) {
    queryArgs.search = searchQuery;
  }
  
  const products = useQuery(api.products.list, queryArgs);
  const categories = useQuery(api.categories.list, {});
  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const cart = useQuery(api.cart.getCart, user ? { userId: user._id as any } : "skip");
  const addToCart = useMutation(api.cart.addToCart);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
    
    // Загружаем локальные количества
    const localCart = cartStore.getCart();
    const localQuantities: Record<string, number> = {};
    Object.values(localCart).forEach(item => {
      localQuantities[item.productId] = item.quantity;
    });
    setQuantities(localQuantities);

    // Слушаем события очистки корзины
    const handleCartCleared = () => {
      setQuantities({});
    };

    // Слушаем события обновления корзины
    const handleCartUpdated = () => {
      const updatedCart = cartStore.getCart();
      const updatedQuantities: Record<string, number> = {};
      Object.values(updatedCart).forEach(item => {
        updatedQuantities[item.productId] = item.quantity;
      });
      setQuantities(updatedQuantities);
    };

    window.addEventListener("cartCleared", handleCartCleared);
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => {
      window.removeEventListener("cartCleared", handleCartCleared);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
    }
  }, [currentUser, token]);

  // Синхронизируем локальную корзину с серверной при загрузке
  useEffect(() => {
    if (user && cart) {
      // Создаём карту серверной корзины
      const serverCart: Record<string, number> = {};
      cart.items?.forEach((item: any) => {
        serverCart[item.productId] = item.quantity;
      });

      // Получаем локальную корзину
      const localCart = cartStore.getCart();
      const localQuantities: Record<string, number> = {};
      Object.values(localCart).forEach(item => {
        localQuantities[item.productId] = item.quantity;
      });

      // Синхронизируем: если товара нет на сервере, удаляем из локального хранилища
      Object.keys(localQuantities).forEach(productId => {
        if (!(productId in serverCart)) {
          cartStore.updateQuantity(productId, 0, 0);
          delete localQuantities[productId];
        }
      });

      setQuantities(localQuantities);
    }
  }, [user, cart]);

  // Load images for products asynchronously
  useEffect(() => {
    if (products && products.length > 0) {
      products.forEach((product: Product) => {
        if (!productImages[product._id]) {
          // Load image asynchronously
          const loadImage = async () => {
            try {
              // Check cache first
              const cachedImage = imageCache.get(product._id);
              
              if (cachedImage) {
                setProductImages(prev => ({
                  ...prev,
                  [product._id]: cachedImage
                }));
                return;
              }
              
              // If not in cache, fetch from API
              const response = await fetch(`/api/product-image/${product._id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.image) {
                  // Store in cache
                  imageCache.set(product._id, data.image);
                  
                  setProductImages(prev => ({
                    ...prev,
                    [product._id]: data.image
                  }));
                }
              }
            } catch (error) {
              // Image failed to load, continue
            }
          };
          loadImage();
        }
      });
    }
  }, [products]);

  const filteredProducts = products || [];

  const handleAddToCart = async (productId: string, amount: number) => {
    if (!user) {
      toast.error("Пожалуйста, авторизуйтесь");
      return;
    }

    const currentQuantity = quantities[productId] || 0;
    const newQuantity = currentQuantity + amount;

    if (newQuantity < 0) {
      return;
    }

    if (newQuantity === 0) {
      setQuantities({
        ...quantities,
        [productId]: 0,
      });
      cartStore.updateQuantity(productId, 0, 0);
      return;
    }

    // Получаем цену товара
    const product = products?.find(p => p._id === productId);
    if (!product) return;

    // Оптимистичное обновление - мгновенно обновляем UI
    setQuantities({
      ...quantities,
      [productId]: newQuantity,
    });
    cartStore.updateQuantity(productId, newQuantity, product.price, product.name, product.supplierName);

    // Отправляем событие об обновлении корзины
    window.dispatchEvent(new Event("cartUpdated"));

    // Отменяем предыдущий таймер если есть
    const existingTimeout = pendingUpdates.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Синхронизируем с БД в фоне с задержкой
    const timeout = setTimeout(async () => {
      try {
        await addToCart({
          userId: user._id as any,
          productId: productId as any,
          quantity: amount,
        });
        
        // Удаляем из pendingUpdates
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(productId);
          return newMap;
        });
      } catch (error) {
        // Откатываем изменение если ошибка
        setQuantities({
          ...quantities,
          [productId]: currentQuantity,
        });
        cartStore.updateQuantity(productId, currentQuantity, product.price);
        toast.error(error instanceof Error ? error.message : "Ошибка при добавлении в корзину");
      }
    }, 500); // Задержка 500ms перед отправкой на сервер

    setPendingUpdates(prev => new Map(prev).set(productId, timeout));
  };

  return (
    <div className="p-8 pr-96">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каталог товаров</h1>
          <p className="text-gray-600 mt-2">Просмотр доступных товаров</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Карточки
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Таблица
          </button>
        </div>
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setLimit(50);
              }}
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
              onChange={(e) => {
                setSelectedCategory(e.target.value || null);
                setLimit(50);
              }}
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
                setLimit(50);
              }}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Очистить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/Table */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {products === undefined ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Загрузка товаров...</p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => {
            const quantity = quantities[product._id] || 0;
            const totalPrice = quantity * product.price;

            return viewMode === "grid" ? (
              // Grid View (Card)
              <div
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-200 overflow-hidden flex items-center justify-center relative">
                  {productImages[product._id] ? (
                    <img
                      src={productImages[product._id]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2 animate-pulse">🖼️</div>
                      <p className="text-sm text-gray-500">Загрузка...</p>
                    </div>
                  )}
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
                    <label className="block text-xs font-semibold text-gray-700 mb-3">
                      Количество (кг)
                    </label>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleAddToCart(product._id, -1)}
                        disabled={product.stock <= 0 || quantity === 0}
                        className={`flex-1 py-2 rounded-lg transition font-semibold text-lg ${
                          product.stock > 0 && quantity > 0
                            ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        −
                      </button>
                      
                      <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {quantity.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">кг</p>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product._id, 1)}
                        disabled={product.stock <= 0}
                        className={`flex-1 py-2 rounded-lg transition font-semibold text-lg ${
                          product.stock > 0
                            ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    {quantity > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          Итого: {totalPrice.toFixed(2)} сўм
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Table View (Row)
              <div
                key={product._id}
                className="bg-white rounded-lg shadow p-6 flex items-center gap-6"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {productImages[product._id] ? (
                    <img
                      src={productImages[product._id]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl animate-pulse">
                      🖼️
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Поставщик: {product.supplierName || "Неизвестно"}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-blue-600">
                      {product.price} сўм/кг
                    </span>
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
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAddToCart(product._id, -1)}
                    disabled={product.stock <= 0 || quantity === 0}
                    className={`px-3 py-2 rounded-lg transition font-semibold ${
                      product.stock > 0 && quantity > 0
                        ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    −
                  </button>
                  
                  <div className="w-16 text-center">
                    <p className="font-bold text-gray-900">{quantity.toFixed(0)}</p>
                    <p className="text-xs text-gray-600">кг</p>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product._id, 1)}
                    disabled={product.stock <= 0}
                    className={`px-3 py-2 rounded-lg transition font-semibold ${
                      product.stock > 0
                        ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Total Price */}
                {quantity > 0 && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {totalPrice.toFixed(2)} сўм
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Товары не найдены
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredProducts && filteredProducts.length >= limit && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setLimit(limit + 50)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Загрузить ещё товары
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <CatalogCartSidebar />
    </div>
  );
}
