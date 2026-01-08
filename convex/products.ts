import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const startTime = Date.now();
    const limit = args.limit || 50;
    
    // Fetch all products once
    const allProducts = await ctx.db.query("products").collect();
    console.log(`[products.list] Fetched ${allProducts.length} products in ${Date.now() - startTime}ms`);

    // Filter only active products
    let products = allProducts.filter((p) => p.active !== false);

    // Filter by category if provided
    if (args.categoryId) {
      products = products.filter((p) => p.categoryId === args.categoryId);
    }

    // Filter by search if provided
    if (args.search) {
      const search = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    // Limit results
    products = products.slice(0, limit);

    // Optimize: don't return images in list query to reduce payload
    const optimizedProducts = products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      stock: p.stock,
      active: p.active,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // Don't include image and images to reduce payload size
    }));

    console.log(`[products.list] Returning ${optimizedProducts.length} products in ${Date.now() - startTime}ms`);
    return optimizedProducts;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  },
});

export const getImage = query({
  args: { id: v.id("products") },
  async handler(ctx, args) {
    const product = await ctx.db.get(args.id);
    if (!product) {
      return null;
    }
    return {
      _id: product._id,
      image: product.image,
    };
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
    supplierName: v.string(),
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
    const startTime = Date.now();
    
    // Use index for fast lookup
    const products = await ctx.db
      .query("products")
      .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
      .collect();
    
    console.log(`[products.listBySupplier] Fetched ${products.length} products for supplier ${args.supplierId} in ${Date.now() - startTime}ms`);
    
    // Return without images to reduce payload
    return products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      stock: p.stock,
      active: p.active,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // Don't include image and images to reduce payload size
    }));
  },
});

// Migration: Add supplier names to products that don't have them
export const migrateSupplierNames = mutation({
  args: {},
  async handler(ctx) {
    const products = await ctx.db.query("products").collect();
    const productsNeedingMigration = products.filter((p) => !p.supplierName);

    if (productsNeedingMigration.length === 0) {
      return { success: true, message: "No products need migration", updated: 0 };
    }

    // Get unique supplier IDs
    const supplierIds = [...new Set(productsNeedingMigration.map((p) => p.supplierId))];

    // Batch fetch all suppliers
    const suppliers = await Promise.all(
      supplierIds.map((id) => ctx.db.get(id))
    );

    // Create a map for quick lookup
    const supplierMap = new Map(
      suppliers.map((s) => [s?._id, s?.supplierName || s?.name || "Неизвестно"])
    );

    // Update all products with supplier names
    let updated = 0;
    for (const product of productsNeedingMigration) {
      const supplierName = supplierMap.get(product.supplierId) || "Неизвестно";
      await ctx.db.patch(product._id, {
        supplierName,
        updatedAt: Date.now(),
      });
      updated++;
    }

    return {
      success: true,
      message: `Migration complete. Updated ${updated} products`,
      updated,
    };
  },
});
