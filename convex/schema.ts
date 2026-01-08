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
    supplierName: v.optional(v.string()), // Денормализованное имя поставщика для быстрого доступа
    stock: v.number(),
    rating: v.optional(v.number()),
    reviews: v.optional(v.number()),
    tags: v.array(v.string()),
    active: v.optional(v.boolean()), // Активен ли товар
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
    restaurantInn: v.optional(v.string()),
    restaurantAddress: v.optional(v.string()),
    restaurantCity: v.optional(v.string()),
    restaurantPostalCode: v.optional(v.string()),
    
    // Для поставщика
    supplierName: v.optional(v.string()),
    supplierInn: v.optional(v.string()),
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

  // Счётчик для порядковых номеров заказов
  orderCounters: defineTable({
    name: v.string(), // "orderNumber"
    value: v.number(), // текущее значение счётчика
  }).index("by_name", ["name"]),

  // Заказы
  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.optional(v.number()), // Красивый порядковый номер (опциональный для старых заказов)
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

  // История заказов - логирование всех изменений
  orderHistory: defineTable({
    orderId: v.id("orders"),
    action: v.union(
      v.literal("created"),
      v.literal("item_added"),
      v.literal("item_removed"),
      v.literal("item_quantity_changed"),
      v.literal("status_changed"),
      v.literal("address_changed")
    ),
    details: v.object({
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      productId: v.optional(v.id("products")),
      productName: v.optional(v.string()),
      itemsCount: v.optional(v.number()),
      totalPrice: v.optional(v.number()),
    }),
    changedBy: v.id("users"), // Кто сделал изменение
    createdAt: v.number(),
  })
    .index("by_order", ["orderId"]),

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
