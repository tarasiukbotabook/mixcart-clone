import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Получить корзину пользователя
export const getCart = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const startTime = Date.now();
    
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      return null;
    }

    // Получаем информацию о товарах в корзине (без изображений)
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product: product ? {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            supplierName: product.supplierName,
            // Don't include image to reduce payload
          } : null,
        };
      })
    );

    console.log(`[cart.getCart] Fetched cart with ${cart.items.length} items in ${Date.now() - startTime}ms`);

    return {
      ...cart,
      items: itemsWithDetails,
    };
  },
});

// Добавить товар в корзину
export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  async handler(ctx, args) {
    // Получаем товар
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Получаем корзину
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      // Создаем новую корзину
      const cartId = await ctx.db.insert("carts", {
        userId: args.userId,
        items: [
          {
            productId: args.productId,
            quantity: args.quantity,
            price: product.price,
          },
        ],
        updatedAt: Date.now(),
      });
      return await ctx.db.get(cartId);
    }

    // Проверяем, есть ли уже этот товар в корзине
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === args.productId
    );

    if (existingItemIndex !== -1) {
      // Обновляем количество
      cart.items[existingItemIndex].quantity += args.quantity;
    } else {
      // Добавляем новый товар
      cart.items.push({
        productId: args.productId,
        quantity: args.quantity,
        price: product.price,
      });
    }

    await ctx.db.patch(cart._id, {
      items: cart.items,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(cart._id);
  },
});

// Обновить количество товара в корзине
export const updateCartItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  async handler(ctx, args) {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === args.productId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    if (args.quantity <= 0) {
      // Удаляем товар
      cart.items.splice(itemIndex, 1);
    } else {
      // Обновляем количество
      cart.items[itemIndex].quantity = args.quantity;
    }

    await ctx.db.patch(cart._id, {
      items: cart.items,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(cart._id);
  },
});

// Удалить товар из корзины
export const removeFromCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  async handler(ctx, args) {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter((item) => item.productId !== args.productId);

    await ctx.db.patch(cart._id, {
      items: cart.items,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(cart._id);
  },
});

// Очистить корзину
export const clearCart = mutation({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    await ctx.db.patch(cart._id, {
      items: [],
      updatedAt: Date.now(),
    });

    return await ctx.db.get(cart._id);
  },
});
