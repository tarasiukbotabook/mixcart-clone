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

// Simple hash function for passwords
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export const seedTestData = mutation({
  args: {},
  async handler(ctx) {
    // Create test supplier
    const supplierEmail = "supplier@test.com";
    const supplierPassword = "password123";
    
    let supplier = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", supplierEmail))
      .first();

    if (!supplier) {
      const supplierId = await ctx.db.insert("users", {
        email: supplierEmail,
        password: hashPassword(supplierPassword),
        name: "Test Supplier",
        phone: "+998901234567",
        type: "supplier",
        supplierName: "Свежие овощи",
        supplierInn: "123456789012",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      supplier = await ctx.db.get(supplierId);
    }

    // Create test restaurant
    const restaurantEmail = "restaurant@test.com";
    const restaurantPassword = "password123";
    
    let restaurant = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", restaurantEmail))
      .first();

    if (!restaurant) {
      const restaurantId = await ctx.db.insert("users", {
        email: restaurantEmail,
        password: hashPassword(restaurantPassword),
        name: "Test Restaurant",
        phone: "+998901234568",
        type: "restaurant",
        restaurantName: "Тестовый ресторан",
        restaurantInn: "987654321098",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      restaurant = await ctx.db.get(restaurantId);
    }

    // Get or create categories
    const categories = await ctx.db.query("categories").collect();
    
    if (categories.length === 0) {
      const categoryData = [
        { name: "Овощи", slug: "vegetables" },
        { name: "Фрукты", slug: "fruits" },
        { name: "Молочные продукты", slug: "dairy" },
      ];

      for (const cat of categoryData) {
        await ctx.db.insert("categories", {
          ...cat,
          description: cat.name,
          createdAt: Date.now(),
        });
      }
    }

    // Get first category for products
    const allCategories = await ctx.db.query("categories").collect();
    const firstCategory = allCategories[0];

    if (firstCategory && supplier) {
      // Create test products
      const existingProducts = await ctx.db
        .query("products")
        .withIndex("by_supplier", (q) => q.eq("supplierId", supplier._id))
        .collect();

      if (existingProducts.length === 0) {
        await ctx.db.insert("products", {
          name: "Помидоры свежие",
          slug: "tomatoes-fresh",
          description: "Спелые красные помидоры",
          price: 15000,
          image: "https://images.unsplash.com/photo-1592924357228-91a4daadcccf?w=400",
          images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcccf?w=400"],
          categoryId: firstCategory._id,
          supplierId: supplier._id,
          supplierName: supplier.supplierName || supplier.name,
          stock: 100,
          rating: 4.5,
          reviews: 10,
          tags: ["свежий", "органический"],
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert("products", {
          name: "Огурцы",
          slug: "cucumbers",
          description: "Свежие хрустящие огурцы",
          price: 12000,
          image: "https://images.unsplash.com/photo-1604977527235-acce64e27793?w=400",
          images: ["https://images.unsplash.com/photo-1604977527235-acce64e28793?w=400"],
          categoryId: firstCategory._id,
          supplierId: supplier._id,
          supplierName: supplier.supplierName || supplier.name,
          stock: 50,
          rating: 4.2,
          reviews: 8,
          tags: ["свежий"],
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return {
      success: true,
      message: "Test data seeded",
      supplier: {
        email: supplierEmail,
        password: supplierPassword,
      },
      restaurant: {
        email: restaurantEmail,
        password: restaurantPassword,
      },
    };
  },
});
