"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { CloseIcon } from "./Icons";

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

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CartModal({ isOpen, onClose, userId }: CartModalProps) {
  const [token, setToken] = useState<string | null>(null);

  const cart = useQuery(api.cart.getCart, userId ? { userId: userId as any } : "skip");
  const updateCartItem = useMutation(api.cart.updateCartItem);
  const removeFromCart = useMutation(api.cart.removeFromCart);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart({
          userId: userId as any,
          productId: productId as any,
        });
        toast.success("Товар удален из корзины");
      } else {
        await updateCartItem({
          userId: userId as any,
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
    try {
      await removeFromCart({
        userId: userId as any,
        productId: productId as any,
      });
      toast.success("Товар удален из корзины");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении товара");
    }
  };

  const cartItems = (cart?.items || []) as CartItem[];
  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full md:w-96 h-screen md:h-auto md:rounded-lg md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                >
                  {/* Product Image */}
                  {item.product && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product?.name || "Товар"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.price} сўм/кг
                    </p>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {(item.quantity * item.price).toFixed(2)} сўм
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Корзина пуста</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Товаров:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Вес:</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} кг</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Итого:</span>
                <span className="text-blue-600">{totalPrice.toFixed(2)} сўм</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              Оформить заказ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
