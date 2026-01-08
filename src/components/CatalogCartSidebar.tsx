"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cartStore } from "@/utils/cartStore";
import { imageCache } from "@/utils/imageCache";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  supplierName?: string;
}

interface Product {
  _id: string;
  name: string;
  supplierName?: string;
  price: number;
}

export default function CatalogCartSidebar() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const removeFromCart = useMutation(api.cart.removeFromCart);
  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");

  // Загружаем текущего пользователя
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser);
    }
  }, [currentUser, token]);

  // Загружаем все товары для получения информации о поставщиках
  const allProducts = useQuery(api.products.list, { limit: 1000 });

  // Сохраняем товары в состояние для быстрого доступа
  useEffect(() => {
    if (allProducts) {
      const productsMap: Record<string, Product> = {};
      allProducts.forEach((product: any) => {
        productsMap[product._id] = {
          _id: product._id,
          name: product.name,
          supplierName: product.supplierName,
          price: product.price,
        };
      });
      setProducts(productsMap);
    }
  }, [allProducts]);

  // Загружаем корзину из localStorage
  useEffect(() => {
    const loadCart = () => {
      const cart = cartStore.getCart();
      const items = Object.values(cart).map((item) => {
        // Если информация о товаре отсутствует, берём из загруженных товаров
        if (!item.name && products[item.productId]) {
          return {
            ...item,
            name: products[item.productId].name,
            supplierName: products[item.productId].supplierName,
          };
        }
        return item;
      });
      setCartItems(items);
    };

    loadCart();

    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      loadCart();
    };

    // Также слушаем пользовательские события
    const handleCartUpdate = () => {
      loadCart();
    };

    // Слушаем событие очистки корзины
    const handleCartCleared = () => {
      setCartItems([]);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("cartCleared", handleCartCleared);
    
    // Проверяем корзину каждые 100ms для синхронизации
    const interval = setInterval(loadCart, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("cartCleared", handleCartCleared);
      clearInterval(interval);
    };
  }, [products]);

  // Загружаем изображения товаров
  useEffect(() => {
    cartItems.forEach((item) => {
      if (!productImages[item.productId]) {
        const loadImage = async () => {
          try {
            const cachedImage = imageCache.get(item.productId);

            if (cachedImage) {
              setProductImages((prev) => ({
                ...prev,
                [item.productId]: cachedImage,
              }));
              return;
            }

            const response = await fetch(`/api/product-image/${item.productId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.image) {
                imageCache.set(item.productId, data.image);
                setProductImages((prev) => ({
                  ...prev,
                  [item.productId]: data.image,
                }));
              }
            }
          } catch (error) {
            // Image failed to load
          }
        };
        loadImage();
      }
    });
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    router.push("/restaurant/cart");
  };

  const handleRemoveItem = async (productId: string) => {
    // Удаляем из локального хранилища
    cartStore.updateQuantity(productId, 0, 0);
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    
    // Удаляем с сервера если пользователь авторизован
    if (user) {
      try {
        await removeFromCart({
          userId: user._id as any,
          productId: productId as any,
        });
      } catch (error) {
        console.error("Failed to remove from cart on server:", error);
      }
    }
    
    // Отправляем событие об обновлении корзины в каталог
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <>
      {/* Sidebar - только на больших экранах */}
      <div className="hidden lg:flex fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-40 border-l border-gray-200 flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
        </div>

        {cartItems.length > 0 ? (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0"
                >
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {productImages[item.productId] ? (
                      <img
                        src={productImages[item.productId]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl animate-pulse">
                        🖼️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {item.name || "Товар"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.supplierName || "Поставщик"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-600">
                        {item.quantity} кг
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(item.quantity * item.price).toFixed(0)} сўм
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-700 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border-t border-gray-200 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Товаров:</span>
                  <span className="font-semibold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Вес:</span>
                  <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(0)} кг</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                  <span>Сумма:</span>
                  <span className="text-blue-600">{cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(0)} сўм</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition font-semibold"
              >
                Оформить
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg">Корзина пуста</p>
          </div>
        )}
      </div>
    </>
  );
}
