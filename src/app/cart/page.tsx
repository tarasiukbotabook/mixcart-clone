"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    _id: string;
    name: string;
    image: string;
    slug: string;
  };
}

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

export default function CartPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const cart = useQuery(api.cart.getCart, user ? { userId: user._id as any } : "skip");
  const updateCartItem = useMutation(api.cart.updateCartItem);
  const removeFromCart = useMutation(api.cart.removeFromCart);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
    }
  }, [currentUser, token]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!user) return;

    try {
      if (newQuantity <= 0) {
        await removeFromCart({
          userId: user._id as any,
          productId: productId as any,
        });
        toast.success("Товар удален из корзины");
      } else {
        await updateCartItem({
          userId: user._id as any,
          productId: productId as any,
          quantity: newQuantity,
        });
        toast.success("Корзина обновлена");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при обновлении корзины");
    }
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;

    try {
      await removeFromCart({
        userId: user._id as any,
        productId: productId as any,
      });
      toast.success("Товар удален из корзины");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении товара");
    }
  };

  const cartItems = (cart?.items || []) as CartItem[];
  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            HubFood
          </Link>
          <div className="flex gap-4">
            <Link href="/restaurant/catalog" className="text-gray-700 hover:text-blue-600">
              Каталог
            </Link>
            <Link href="/cart" className="text-blue-600 font-semibold">
              Корзина
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>

        {!user ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Пожалуйста, авторизуйтесь для просмотра корзины</p>
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Войти
            </Link>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-6 border-b border-gray-200 last:border-b-0 flex gap-4"
                  >
                    {/* Product Image */}
                    {item.product && (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.product?.name || "Товар"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {item.price} сўм/кг
                      </p>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 0.1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity.toFixed(1)}
                            onChange={(e) => handleQuantityChange(item.productId, parseFloat(e.target.value))}
                            step="0.1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 0.1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-600 ml-2">кг</span>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="ml-auto text-red-600 hover:text-red-700 font-medium"
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
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Итого</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Товаров:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Вес:</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)} кг</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                    <span>Сумма:</span>
                    <span className="text-blue-600">{totalPrice.toFixed(2)} сўм</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-3">
                  Оформить заказ
                </button>

                <Link
                  href="/restaurant/catalog"
                  className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Продолжить покупки
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Корзина пуста</p>
            <Link
              href="/restaurant/catalog"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Продолжить покупки
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
