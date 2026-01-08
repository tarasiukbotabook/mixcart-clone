import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Получить следующий номер заказа
async function getNextOrderNumber(ctx: any) {
  let counter = await ctx.db
    .query("orderCounters")
    .withIndex("by_name", (q: any) => q.eq("name", "orderNumber"))
    .first();

  if (!counter) {
    // Создаём счётчик, если его нет
    const counterId = await ctx.db.insert("orderCounters", {
      name: "orderNumber",
      value: 1,
    });
    return 1;
  }

  // Увеличиваем счётчик
  const nextNumber = counter.value + 1;
  await ctx.db.patch(counter._id, {
    value: nextNumber,
  });

  return nextNumber;
}

// Миграция: присвоить порядковые номера всем заказам
export const migrateOrderNumbers = mutation({
  args: {},
  async handler(ctx) {
    const allOrders = await ctx.db.query("orders").collect();
    
    // Сортируем по дате создания
    const sortedOrders = allOrders.sort((a, b) => a.createdAt - b.createdAt);
    
    let maxOrderNumber = 0;
    
    // Присваиваем порядковые номера
    for (let i = 0; i < sortedOrders.length; i++) {
      const order = sortedOrders[i];
      if (!order.orderNumber) {
        const orderNumber = i + 1;
        await ctx.db.patch(order._id, {
          orderNumber: orderNumber,
        });
        maxOrderNumber = Math.max(maxOrderNumber, orderNumber);
      } else {
        maxOrderNumber = Math.max(maxOrderNumber, order.orderNumber);
      }
    }
    
    // Обновляем или создаём счётчик
    let counter = await ctx.db
      .query("orderCounters")
      .withIndex("by_name", (q) => q.eq("name", "orderNumber"))
      .first();

    if (counter) {
      await ctx.db.patch(counter._id, {
        value: maxOrderNumber,
      });
    } else {
      await ctx.db.insert("orderCounters", {
        name: "orderNumber",
        value: maxOrderNumber,
      });
    }
    
    return { migratedCount: sortedOrders.filter(o => !o.orderNumber).length, maxOrderNumber };
  },
});

// Получить историю заказа
export const getOrderHistory = query({
  args: { orderId: v.id("orders") },
  async handler(ctx, args) {
    const history = await ctx.db
      .query("orderHistory")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .collect();

    // Получаем информацию о пользователях, которые сделали изменения
    const historyWithUsers = await Promise.all(
      history.map(async (entry) => {
        const user = await ctx.db.get(entry.changedBy);
        return {
          ...entry,
          changedByName: user?.name || "Неизвестный пользователь",
        };
      })
    );

    return historyWithUsers;
  },
});

// Получить заказы пользователя
export const getByUser = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Получаем информацию о товарах в каждом заказе
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return {
              ...item,
              product: product ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                supplierName: product.supplierName,
              } : null,
            };
          })
        );

        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Получить заказы для поставщика (заказы его товаров)
export const getBySupplier = query({
  args: { supplierId: v.id("users") },
  async handler(ctx, args) {
    // Получаем все товары поставщика
    const supplierProducts = await ctx.db
      .query("products")
      .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
      .collect();

    const productIds = new Set(supplierProducts.map((p) => p._id));

    // Получаем все заказы
    const allOrders = await ctx.db.query("orders").collect();

    // Фильтруем заказы, которые содержат товары поставщика
    const supplierOrders = allOrders
      .filter((order) =>
        order.items.some((item) => productIds.has(item.productId))
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    // Получаем информацию о товарах и ресторанах
    const ordersWithDetails = await Promise.all(
      supplierOrders.map(async (order) => {
        const restaurant = await ctx.db.get(order.userId);
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return {
              ...item,
              product: product ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
              } : null,
            };
          })
        );

        return {
          ...order,
          items: itemsWithDetails,
          restaurant: restaurant ? {
            _id: restaurant._id,
            name: restaurant.restaurantName || restaurant.name,
            phone: restaurant.phone,
          } : null,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Создать заказ из корзины
export const createFromCart = mutation({
  args: {
    userId: v.id("users"),
    shippingAddress: v.object({
      fullName: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.string(),
    }),
  },
  async handler(ctx, args) {
    // Получаем корзину
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Получаем следующий номер заказа
    const orderNumber = await getNextOrderNumber(ctx);

    // Создаём заказ
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      orderNumber: orderNumber,
      items: cart.items,
      totalPrice,
      status: "pending",
      shippingAddress: args.shippingAddress,
      createdAt: now,
      updatedAt: now,
    });

    // Логируем создание заказа
    await ctx.db.insert("orderHistory", {
      orderId: orderId,
      action: "created",
      details: {
        itemsCount: cart.items.length,
        totalPrice: totalPrice,
      },
      changedBy: args.userId,
      createdAt: now,
    });

    // Очищаем корзину
    await ctx.db.patch(cart._id, {
      items: [],
      updatedAt: now,
    });

    return await ctx.db.get(orderId);
  },
});

// Обновить статус заказа
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Логируем изменение статуса
    await ctx.db.insert("orderHistory", {
      orderId: args.orderId,
      action: "status_changed",
      details: {
        oldValue: oldStatus,
        newValue: args.status,
      },
      changedBy: args.userId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(args.orderId);
  },
});

// Удалить товар из заказа
export const removeOrderItem = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const product = await ctx.db.get(args.productId);
    const productName = product?.name || "Неизвестный товар";

    // Находим товар в заказе
    const itemIndex = order.items.findIndex((item) => item.productId === args.productId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    const removedItem = order.items[itemIndex];

    // Удаляем товар
    const newItems = order.items.filter((item) => item.productId !== args.productId);
    const newTotalPrice = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await ctx.db.patch(args.orderId, {
      items: newItems,
      totalPrice: newTotalPrice,
      updatedAt: Date.now(),
    });

    // Логируем удаление
    await ctx.db.insert("orderHistory", {
      orderId: args.orderId,
      action: "item_removed",
      details: {
        productId: args.productId,
        productName: productName,
        oldValue: {
          quantity: removedItem.quantity,
          price: removedItem.price,
        },
      },
      changedBy: args.userId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(args.orderId);
  },
});

// Изменить количество товара в заказе
export const updateOrderItemQuantity = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const product = await ctx.db.get(args.productId);
    const productName = product?.name || "Неизвестный товар";

    // Находим товар в заказе
    const itemIndex = order.items.findIndex((item) => item.productId === args.productId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    const oldQuantity = order.items[itemIndex].quantity;

    // Обновляем количество
    const newItems = [...order.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      quantity: args.quantity,
    };

    const newTotalPrice = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await ctx.db.patch(args.orderId, {
      items: newItems,
      totalPrice: newTotalPrice,
      updatedAt: Date.now(),
    });

    // Логируем изменение количества
    await ctx.db.insert("orderHistory", {
      orderId: args.orderId,
      action: "item_quantity_changed",
      details: {
        productId: args.productId,
        productName: productName,
        oldValue: oldQuantity,
        newValue: args.quantity,
      },
      changedBy: args.userId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(args.orderId);
  },
});
