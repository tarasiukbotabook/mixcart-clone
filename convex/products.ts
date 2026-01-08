import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    search: v.optional(v.string()),
  },
  async handler(ctx, args) {
    let products = await ctx.db.query("products").collect();

    // Filter only active products
    products = products.filter((p) => p.active !== false);

    if (args.categoryId) {
      products = products.filter((p) => p.categoryId === args.categoryId);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    // Добавляем информацию о поставщике
    const productsWithSupplier = await Promise.all(
      products.map(async (product) => {
        const supplier = await ctx.db.get(product.supplierId);
        return {
          ...product,
          supplierName: supplier?.supplierName || supplier?.name || "Неизвестно",
        };
      })
    );

    return productsWithSupplier;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    image: v.string(),
    images: v.array(v.string()),
    categoryId: v.id("categories"),
    supplierId: v.id("users"),
    stock: v.number(),
    tags: v.array(v.string()),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("products", {
      ...args,
      rating: 0,
      reviews: 0,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

// Get all products for a supplier (including inactive)
export const listBySupplier = query({
  args: { supplierId: v.id("users") },
  async handler(ctx, args) {
    const products = await ctx.db
      .query("products")
      .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
      .collect();

    return products;
  },
});
