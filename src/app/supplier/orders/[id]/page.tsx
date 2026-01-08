"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { imageCache } from "@/utils/imageCache";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
}

export default function SupplierOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});

  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const allOrders = useQuery(api.orders.getBySupplier, user ? { supplierId: user._id as any } : "skip");
  const orderHistory = useQuery(api.orders.getOrderHistory, order ? { orderId: order._id as any } : "skip");
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const removeOrderItem = useMutation(api.orders.removeOrderItem);
  const updateOrderItemQuantity = useMutation(api.orders.updateOrderItemQuantity);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUser(currentUser as User);
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (allOrders && Array.isArray(allOrders)) {
      const foundOrder = allOrders.find((o: any) => o._id === orderId);
      setOrder(foundOrder || null);
      if (foundOrder) {
        const quantities: Record<string, number> = {};
        foundOrder.items.forEach((item: any) => {
          quantities[item.productId] = item.quantity;
        });
        setEditedQuantities(quantities);
      }
    }
  }, [allOrders, orderId]);

  useEffect(() => {
    if (orderHistory) {
      setHistory(orderHistory);
    }
  }, [orderHistory]);

  useEffect(() => {
    if (order?.items) {
      order.items.forEach((item: any) => {
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
    }
  }, [order]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидание";
      case "confirmed":
        return "Подтверждено";
      case "shipped":
        return "Доставляется";
      case "delivered":
        return "Завершено";
      case "cancelled":
        return "Отменено";
      default:
        return status;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "Заказ создан";
      case "item_added":
        return "Товар добавлен";
      case "item_removed":
        return "Товар удалён";
      case "item_quantity_changed":
        return "Количество изменено";
      case "status_changed":
        return "Статус изменён";
      case "address_changed":
        return "Адрес изменён";
      default:
        return action;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !order) return;
    try {
      await updateOrderStatus({
        orderId: order._id as any,
        status: newStatus as any,
        userId: user._id as any,
      });
      toast.success("Статус заказа обновлён");
    } catch (error) {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user || !order) return;
    try {
      await removeOrderItem({
        orderId: order._id as any,
        productId: productId as any,
        userId: user._id as any,
      });
      toast.success("Товар удалён из заказа");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении товара");
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !order) return;
    try {
      for (const item of order.items) {
        const newQuantity = editedQuantities[item.productId];
        if (newQuantity !== item.quantity) {
          if (newQuantity <= 0) {
            await removeOrderItem({
              orderId: order._id as any,
              productId: item.productId as any,
              userId: user._id as any,
            });
          } else {
            await updateOrderItemQuantity({
              orderId: order._id as any,
              productId: item.productId as any,
              quantity: newQuantity,
              userId: user._id as any,
            });
          }
        }
      }
      toast.success("Изменения сохранены");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении изменений");
    }
  };

  const handleCancel = () => {
    if (order) {
      const quantities: Record<string, number> = {};
      order.items.forEach((item: any) => {
        quantities[item.productId] = item.quantity;
      });
      setEditedQuantities(quantities);
    }
    setIsEditing(false);
  };

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Заказ не найден</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Заказ №{order.orderNumber || order._id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 mt-2">
            От: {order.restaurant?.name || "Неизвестный ресторан"}
          </p>
          <p className="text-gray-600">
            Создан: {new Date(order.createdAt).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Редактировать
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  Отмена
                </button>
              </>
            )}
          </div>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Ожидание</option>
            <option value="confirmed">Подтверждено</option>
            <option value="shipped">Доставляется</option>
            <option value="delivered">Завершено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Товары в заказе</h2>
            <div className="space-y-6">
              {order.items.map((item: any) => (
                <div key={item.productId} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {productImages[item.productId] ? (
                      <img
                        src={productImages[item.productId]}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl animate-pulse">
                        🖼️
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product?.name || "Товар"}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-blue-600">
                        {item.price} сўм/кг
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={editedQuantities[item.productId] || 0}
                            onChange={(e) => setEditedQuantities(prev => ({
                              ...prev,
                              [item.productId]: parseFloat(e.target.value) || 0,
                            }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">кг</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">
                          Количество: {item.quantity} кг
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {isEditing 
                        ? (editedQuantities[item.productId] * item.price).toFixed(2)
                        : (item.quantity * item.price).toFixed(2)
                      } сўм
                    </p>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">История заказа</h2>
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((entry: any, index: number) => (
                  <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getActionLabel(entry.action)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.changedByName}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {entry.action === "status_changed" && (
                      <p className="text-sm text-gray-600">
                        {getStatusLabel(entry.details.oldValue)} → {getStatusLabel(entry.details.newValue)}
                      </p>
                    )}
                    {entry.action === "item_removed" && (
                      <p className="text-sm text-gray-600">
                        {entry.details.productName} ({entry.details.oldValue.quantity} кг)
                      </p>
                    )}
                    {entry.action === "item_quantity_changed" && (
                      <p className="text-sm text-gray-600">
                        {entry.details.productName}: {entry.details.oldValue} кг → {entry.details.newValue} кг
                      </p>
                    )}
                    {entry.action === "created" && (
                      <p className="text-sm text-gray-600">
                        {entry.details.itemsCount} товар(ов), сумма: {entry.details.totalPrice.toFixed(2)} сўм
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">История пуста</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Итого</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Товаров:</span>
                <span className="font-semibold">{order.items.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Вес:</span>
                <span className="font-semibold">
                  {isEditing
                    ? Object.values(editedQuantities).reduce((sum: number, q: any) => sum + q, 0).toFixed(0)
                    : order.items.reduce((sum: number, item: any) => sum + item.quantity, 0).toFixed(0)
                  } кг
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                <span>Сумма:</span>
                <span className="text-blue-600">
                  {isEditing
                    ? order.items.reduce((sum: number, item: any) => {
                        const qty = editedQuantities[item.productId] || 0;
                        return sum + (qty * item.price);
                      }, 0).toFixed(2)
                    : order.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0).toFixed(2)
                  } сўм
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Информация о ресторане</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">{order.restaurant?.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Телефон: {order.restaurant?.phone}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Вернуться
          </button>
        </div>
      </div>
    </div>
  );
}
