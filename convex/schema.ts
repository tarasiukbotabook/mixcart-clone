import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Категории товаров
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  // Товары (от поставщиков)
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    image: v.string(),
    images: v.array(v.string()),
    categoryId: v.id("categories"),
    supplierId: v.id("users"), // Поставщик
    stock: v.number(),
    rating: v.optional(v.number()),
    reviews: v.optional(v.number()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_supplier", ["supplierId"])
    .index("by_slug", ["slug"]),

  // Пользователи (Рестораны и Поставщики)
  users: defineTable({
    email: v.string(),
    password: v.string(), // хешированный пароль
    name: v.string(),
    phone: v.string(),
    type: v.union(v.literal("restaurant"), v.literal("supplier")),
    
    // Для ресторана
    restaurantName: v.optional(v.string()),
    restaurantAddress: v.optional(v.string()),
    restaurantCity: v.optional(v.string()),
    restaurantPostalCode: v.optional(v.string()),
    
    // Для поставщика
    supplierName: v.optional(v.string()),
    supplierAddress: v.optional(v.string()),
    supplierCity: v.optional(v.string()),
    supplierPostalCode: v.optional(v.string()),
    supplierDescription: v.optional(v.string()),
    
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Сессии пользователей
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  // Корзина
  carts: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Заказы
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    shippingAddress: v.object({
      fullName: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Отзывы
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  // Избранное
  favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),
});
