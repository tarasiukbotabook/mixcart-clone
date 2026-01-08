import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCart = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    return await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const addItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  async handler(ctx, args) {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      cart = await ctx.db.insert("carts", {
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
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId === args.productId
      );
      if (existingItem) {
        existingItem.quantity += args.quantity;
      } else {
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
    }

    return cart;
  },
});

export const removeItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  async handler(ctx, args) {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!cart) throw new Error("Cart not found");

    const updatedItems = cart.items.filter(
      (item) => item.productId !== args.productId
    );

    if (updatedItems.length === 0) {
      await ctx.db.delete(cart._id);
      return null;
    }

    await ctx.db.patch(cart._id, {
      items: updatedItems,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(cart._id);
  },
});

export const clearCart = mutation({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (cart) {
      await ctx.db.delete(cart._id);
    }

    return null;
  },
});
