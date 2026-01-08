import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Простая функция для хеширования
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

// Регистрация ресторана
export const registerRestaurant = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    phone: v.string(),
  },
  async handler(ctx, args) {
    console.log("registerRestaurant called with:", args.email);
    
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
      const hashedPassword = hashPassword(args.password);
      console.log("Password hashed");

      // Создание пользователя
      const userId = await ctx.db.insert("users", {
        email: args.email,
        password: hashedPassword,
        name: args.email.split("@")[0],
        phone: args.phone,
        type: "restaurant",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log("User created:", userId);

      // Создание сессии
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await ctx.db.insert("sessions", {
        userId,
        token,
        expiresAt,
        createdAt: Date.now(),
      });

      console.log("Session created");

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
    phone: v.string(),
  },
  async handler(ctx, args) {
    console.log("registerSupplier called with:", args.email);
    
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
      const hashedPassword = hashPassword(args.password);

      // Создание пользователя
      const userId = await ctx.db.insert("users", {
        email: args.email,
        password: hashedPassword,
        name: args.email.split("@")[0],
        phone: args.phone,
        type: "supplier",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Создание сессии
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await ctx.db.insert("sessions", {
        userId,
        token,
        expiresAt,
        createdAt: Date.now(),
      });

      return { userId, token };
    } catch (error) {
      console.error("registerSupplier error:", error);
      throw error;
    }
  },
});

// Вход
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    console.log("login called with:", args.email);
    
    try {
      // Поиск пользователя
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Проверка пароля
      const isPasswordValid = verifyPassword(args.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      // Создание сессии
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await ctx.db.insert("sessions", {
        userId: user._id,
        token,
        expiresAt,
        createdAt: Date.now(),
      });

      return { userId: user._id, token };
    } catch (error) {
      console.error("login error:", error);
      throw error;
    }
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
