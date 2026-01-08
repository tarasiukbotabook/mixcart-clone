"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { imageCache } from "@/utils/imageCache";
import CartSkeleton from "@/components/CartSkeleton";
import { cartStore } from "@/utils/cartStore";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    _id: string;
    name: string;
    slug: string;
    supplierName?: string;
  } | null;
}

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

export default function RestaurantCart() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});

  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const cart = useQuery(api.cart.getCart, user ? { userId: user._id as any } : "skip");
  const updateCartItem = useMutation(api.cart.updateCartItem);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const createOrder = useMutation(api.orders.createFromCart);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
      setIsLoading(false);
      
      // Синхронизируем локальное хранилище с серверной корзиной
      if (cart?.items) {
        const serverCart: Record<string, any> = {};
        cart.items.forEach((item: CartItem) => {
          serverCart[item.productId] = {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          };
        });
        cartStore.syncWithServer(serverCart);
        
        // Загружаем локальные количества
        const localCart = cartStore.getCart();
        const quantities: Record<string, number> = {};
        Object.values(localCart).forEach(item => {
          quantities[item.productId] = item.quantity;
        });
        setLocalQuantities(quantities);
      }
    }
  }, [currentUser, token, cart]);

  const cartItems = (cart?.items || []) as CartItem[];

  // Load images for cart items asynchronously
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item) => {
        if (!productImages[item.productId]) {
          // Load image asynchronously
          const loadImage = async () => {
            try {
              // Check cache first
              const cachedImage = imageCache.get(item.productId);
              
              if (cachedImage) {
                setProductImages(prev => ({
                  ...prev,
                  [item.productId]: cachedImage
                }));
                return;
              }
              
              // If not in cache, fetch from API
              const response = await fetch(`/api/product-image/${item.productId}`);
              if (response.ok) {
                const data = await response.json();
                if (data.image) {
                  // Store in cache
                  imageCache.set(item.productId, data.image);
                  
                  setProductImages(prev => ({
                    ...prev,
                    [item.productId]: data.image
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
  }, [cartItems]);

  const handleQuantityChange = async (productId: string, newQuantity: number, price: number) => {
    if (!user) return;

    // Оптимистичное обновление - мгновенно обновляем UI
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: newQuantity,
    }));
    cartStore.updateQuantity(productId, newQuantity, price);

    // Отменяем предыдущий таймер если есть
    const existingTimeout = pendingUpdates.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Синхронизируем с БД в фоне с задержкой
    const timeout = setTimeout(async () => {
      try {
        if (newQuantity <= 0) {
          await removeFromCart({
            userId: user._id as any,
            productId: productId as any,
          });
        } else {
          await updateCartItem({
            userId: user._id as any,
            productId: productId as any,
            quantity: newQuantity,
          });
        }
        
        // Удаляем из pendingUpdates
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(productId);
          return newMap;
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Ошибка при обновлении корзины");
      }
    }, 500);

    setPendingUpdates(prev => new Map(prev).set(productId, timeout));
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;

    // Оптимистичное удаление
    setLocalQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
    cartStore.updateQuantity(productId, 0, 0);

    // Отменяем предыдущий таймер если есть
    const existingTimeout = pendingUpdates.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Синхронизируем с БД в фоне с задержкой
    const timeout = setTimeout(async () => {
      try {
        await removeFromCart({
          userId: user._id as any,
          productId: productId as any,
        });
        
        // Удаляем из pendingUpdates
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(productId);
          return newMap;
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Ошибка при удалении товара");
      }
    }, 500);

    setPendingUpdates(prev => new Map(prev).set(productId, timeout));
  };

  const displayItems = cartItems.map(item => ({
    ...item,
    quantity: localQuantities[item.productId] !== undefined ? localQuantities[item.productId] : item.quantity,
  }));

  const totalPrice = displayItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalWeight = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
        <p className="text-gray-600 mt-2">Ваши товары для заказа</p>
      </div>

      {isLoading ? (
        <>
          <CartSkeleton />
        </>
      ) : displayItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {displayItems.map((item) => (
                <div
                  key={item.productId}
                  className="p-6 border-b border-gray-200 last:border-b-0 flex gap-4"
                >
                  {/* Product Image */}
                  {item.product && (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {productImages[item.productId] ? (
                        <img
                          src={productImages[item.productId]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl animate-pulse">🖼️</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.product?.name || "Товар"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.product?.supplierName || "Поставщик не указан"}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {item.price} сўм/кг
                    </p>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, (localQuantities[item.productId] || item.quantity) - 1, item.price)}
                        className="px-3 py-1 rounded transition font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {localQuantities[item.productId] !== undefined ? localQuantities[item.productId] : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, (localQuantities[item.productId] || item.quantity) + 1, item.price)}
                        className="px-3 py-1 rounded transition font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-600 ml-2">кг</span>

                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-auto font-medium transition text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {(item.quantity * item.price).toFixed(2)} сўм
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Итого</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товаров:</span>
                  <span>{displayItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Вес:</span>
                  <span>{totalWeight.toFixed(0)} кг</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                  <span>Сумма:</span>
                  <span className="text-blue-600">{totalPrice.toFixed(2)} сўм</span>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!user) return;
                  
                  try {
                    // Создаём заказ с адресом доставки
                    await createOrder({
                      userId: user._id as any,
                      shippingAddress: {
                        fullName: user.name,
                        phone: user.phone,
                        address: "Адрес доставки", // TODO: добавить форму для ввода адреса
                        city: "Город",
                        postalCode: "00000",
                      },
                    });
                    
                    // Очищаем локальную корзину
                    cartStore.clear();
                    // Отправляем событие об очистке корзины
                    window.dispatchEvent(new Event("cartCleared"));
                    toast.success("Заказ успешно оформлен!");
                    
                    // Перенаправляем на страницу заказов
                    setTimeout(() => {
                      window.location.href = "/restaurant/orders";
                    }, 1000);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Ошибка при оформлении заказа");
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-3"
              >
                Оформить заказ
              </button>

              <button 
                onClick={() => window.location.href = "/restaurant/catalog"}
                className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Продолжить покупки
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-6">Корзина пуста</p>
          <a
            href="/restaurant/catalog"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Перейти в каталог
          </a>
        </div>
      )}
    </div>
  );
}
