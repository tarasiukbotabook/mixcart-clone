import { mutation } from "./_generated/server";

export const seedCategories = mutation({
  args: {},
  async handler(ctx) {
    const categories = [
      {
        name: "Овощи",
        slug: "vegetables",
        description: "Свежие овощи",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      },
      {
        name: "Фрукты",
        slug: "fruits",
        description: "Свежие фрукты",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
      },
      {
        name: "Молочные продукты",
        slug: "dairy",
        description: "Молоко, сыр, йогурт",
        image: "https://images.unsplash.com/photo-1628185519336-c6fb5f1b912d?w=400",
      },
      {
        name: "Мясо и рыба",
        slug: "meat-fish",
        description: "Свежее мясо и рыба",
        image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
      },
      {
        name: "Хлеб и выпечка",
        slug: "bread-bakery",
        description: "Хлеб, булки, выпечка",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
      },
      {
        name: "Специи и приправы",
        slug: "spices",
        description: "Специи и приправы",
        image: "https://images.unsplash.com/photo-1596040707382-e3e5e0f9e3e3?w=400",
      },
    ];

    for (const category of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("categories", {
          ...category,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true, message: "Categories seeded" };
  },
});
