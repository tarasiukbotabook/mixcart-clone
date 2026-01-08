# HubFood - Интернет магазин

Аналог https://mixcart.ru/ построенный на Next.js, Convex и Tailwind CSS.

## Стек технологий

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Convex
- **Hosting**: Vercel
- **State Management**: Zustand
- **Notifications**: React Hot Toast

## Структура проекта

```
mixcart-clone/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Главная страница
│   │   ├── catalog/
│   │   │   └── page.tsx        # Каталог товаров
│   │   ├── cart/
│   │   │   └── page.tsx        # Корзина
│   │   └── product/
│   │       └── [slug]/
│   │           └── page.tsx    # Страница товара
│   └── providers/
│       └── convex-provider.tsx # Convex провайдер
├── convex/
│   ├── schema.ts               # Схема БД
│   ├── products.ts             # API для товаров
│   ├── categories.ts           # API для категорий
│   └── cart.ts                 # API для корзины
├── convex.json                 # Конфиг Convex
├── next.config.ts              # Конфиг Next.js
├── vercel.json                 # Конфиг Vercel
└── package.json
```

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Инициализация Convex

```bash
npx convex dev
```

Это создаст проект Convex и сгенерирует необходимые файлы.

### 3. Обновление переменных окружения

После инициализации Convex обновите `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Запуск локального сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Развертывание на Vercel

### 1. Подготовка

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Развертывание

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте репозиторий
4. Добавьте переменную окружения:
   - `NEXT_PUBLIC_CONVEX_URL` - URL вашего Convex deployment

### 3. Развертывание Convex

```bash
npx convex deploy
```

Это развернет вашу БД в production.

## Основные функции

- ✅ Каталог товаров с фильтрацией по категориям
- ✅ Поиск товаров
- ✅ Страница товара с галереей изображений
- ✅ Корзина (в разработке)
- ✅ Система заказов (в разработке)
- ✅ Отзывы и рейтинги (в разработке)
- ✅ Избранное (в разработке)

## Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Production
npm run start

# Linting
npm run lint

# Convex dev
npx convex dev

# Convex deploy
npx convex deploy
```

## API Endpoints (Convex)

### Товары
- `api.products.list` - Получить список товаров
- `api.products.getById` - Получить товар по ID
- `api.products.getBySlug` - Получить товар по slug
- `api.products.create` - Создать товар
- `api.products.update` - Обновить товар

### Категории
- `api.categories.list` - Получить список категорий
- `api.categories.getById` - Получить категорию по ID
- `api.categories.getBySlug` - Получить категорию по slug
- `api.categories.create` - Создать категорию

### Корзина
- `api.cart.getCart` - Получить корзину пользователя
- `api.cart.addItem` - Добавить товар в корзину
- `api.cart.removeItem` - Удалить товар из корзины
- `api.cart.clearCart` - Очистить корзину

## Следующие шаги

1. Реализовать функциональность корзины
2. Добавить систему заказов
3. Реализовать аутентификацию пользователей
4. Добавить систему отзывов
5. Реализовать избранное
6. Добавить админ-панель
7. Интегрировать платежную систему

## Лицензия

MIT
