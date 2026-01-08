import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Простая функция для хеширования (используем встроенный Node.js модуль)
async function hashPassword(password: string): Promise<string> {
  // Для простоты используем базовый хеш
  // В production используй bcrypt через npm пакет
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Регистрация ресторана
export const registerRestaurant = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    restaurantName: v.string(),
    restaurantAddress: v.string(),
    restaurantCity: v.string(),
    restaurantPostalCode: v.string(),
  },
  async handler(ctx, args) {
    try {
      // Проверка, существует ли уже пользователь с таким email
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Хеширование пароля
      const hashedPassword = await hashPassword(args.password);

      // Создание пользователя
      const userId = await ctx.db.insert("users", {
        email: args.email,
        password: hashedPassword,
        name: args.name,
        phone: args.phone,
        type: "restaurant",
        restaurantName: args.restaurantName,
        restaurantAddress: args.restaurantAddress,
        restaurantCity: args.restaurantCity,
        restaurantPostalCode: args.restaurantPostalCode,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Создание сессии
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней

      await ctx.db.insert("sessions", {
        userId,
        token,
        expiresAt,
        createdAt: Date.now(),
      });

      return { userId, token };
    } catch (error) {
      console.error("registerRestaurant error:", error);
      throw error;
    }
  },
});

// Регистрация поставщика
export const registerSupplier = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    supplierName: v.string(),
    supplierAddress: v.string(),
    supplierCity: v.string(),
    supplierPostalCode: v.string(),
    supplierDescription: v.optional(v.string()),
  },
  async handler(ctx, args) {
    // Проверка, существует ли уже пользователь с таким email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(args.password);

    // Создание пользователя
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: hashedPassword,
      name: args.name,
      phone: args.phone,
      type: "supplier",
      supplierName: args.supplierName,
      supplierAddress: args.supplierAddress,
      supplierCity: args.supplierCity,
      supplierPostalCode: args.supplierPostalCode,
      supplierDescription: args.supplierDescription,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Создание сессии
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return { userId, token };
  },
});

// Вход
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    // Поиск пользователя
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Проверка пароля
    const isPasswordValid = await verifyPassword(args.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Создание сессии
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return { userId: user._id, token };
  },
});

// Получение текущего пользователя по токену
export const getCurrentUser = query({
  args: { token: v.string() },
  async handler(ctx, args) {
    // Поиск сессии
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    // Проверка срока действия сессии
    if (session.expiresAt < Date.now()) {
      // Сессия истекла, но мы не можем удалить в query
      return null;
    }

    // Получение пользователя
    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    // Возвращаем пользователя без пароля
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Удаление истекших сессий
export const cleanupExpiredSessions = mutation({
  args: {},
  async handler(ctx) {
    const sessions = await ctx.db.query("sessions").collect();
    const now = Date.now();

    for (const session of sessions) {
      if (session.expiresAt < now) {
        await ctx.db.delete(session._id);
      }
    }

    return { cleaned: true };
  },
});

// Выход
export const logout = mutation({
  args: { token: v.string() },
  async handler(ctx, args) {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
