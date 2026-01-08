import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("categories").collect();
  },
});

export const getById = query({
  args: { id: v.id("categories") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("categories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
