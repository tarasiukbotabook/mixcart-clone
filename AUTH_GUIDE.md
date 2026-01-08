# Система аутентификации Mixcart

## Обзор

Система поддерживает два типа пользователей:

### 1. **Ресторан** (Покупатель)
- Просмотр товаров от поставщиков
- Размещение заказов
- Отслеживание доставки
- История заказов

### 2. **Поставщик** (Продавец)
- Размещение своих товаров
- Управление каталогом
- Получение заказов от ресторанов
- Аналитика продаж

## Структура БД

### Таблица `users`
```typescript
{
  email: string;
  password: string; // SHA-256 хеш
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  
  // Для ресторана
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantCity?: string;
  restaurantPostalCode?: string;
  
  // Для поставщика
  supplierName?: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierPostalCode?: string;
  supplierDescription?: string;
  
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}
```

### Таблица `sessions`
```typescript
{
  userId: Id<"users">;
  token: string;
  expiresAt: number;
  createdAt: number;
}
```

## API Функции

### Регистрация ресторана
```typescript
registerRestaurant({
  email: string;
  password: string;
  name: string;
  phone: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantPostalCode: string;
})
```

### Регистрация поставщика
```typescript
registerSupplier({
  email: string;
  password: string;
  name: string;
  phone: string;
  supplierName: string;
  supplierAddress: string;
  supplierCity: string;
  supplierPostalCode: string;
  supplierDescription?: string;
})
```

### Вход
```typescript
login({
  email: string;
  password: string;
})
```

### Получение текущего пользователя
```typescript
getCurrentUser({
  token: string;
})
```

### Выход
```typescript
logout({
  token: string;
})
```

## Использование на фронтенде

### Сохранение токена
```typescript
localStorage.setItem("auth_token", token);
```

### Получение текущего пользователя
```typescript
const token = localStorage.getItem("auth_token");
const user = useQuery(api.auth.getCurrentUser, { token });
```

### Выход
```typescript
localStorage.removeItem("auth_token");
```

## Маршруты

- `/` - Главная страница
- `/auth/register` - Регистрация
- `/auth/login` - Вход
- `/dashboard` - Личный кабинет
- `/catalog` - Каталог товаров (для ресторанов)
- `/supplier/products` - Управление товарами (для поставщиков)

## Безопасность

⚠️ **Важно**: В production используйте:
- `bcrypt` вместо SHA-256 для хеширования паролей
- HTTPS для всех запросов
- JWT токены вместо простых строк
- Refresh tokens для продления сессии
- CSRF защиту

## Следующие шаги

1. Реализовать защиту маршрутов (middleware)
2. Добавить восстановление пароля
3. Реализовать двухфакторную аутентификацию
4. Добавить социальную аутентификацию (Google, GitHub)
