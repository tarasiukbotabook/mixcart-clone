# Подключение к GitHub

Проект готов к загрузке на GitHub. Следуйте этим шагам:

## 1. Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Введите имя репозитория: `mixcart-clone`
3. Добавьте описание: "Аналог Mixcart - интернет магазин на Next.js и Convex"
4. Выберите "Public" или "Private" (по вашему выбору)
5. Нажмите "Create repository"

## 2. Подключите удаленный репозиторий

Замените `YOUR_USERNAME` на ваше имя пользователя GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mixcart-clone.git
git branch -M main
git push -u origin main
```

## 3. Подключите Vercel

1. Перейдите на https://vercel.com
2. Нажмите "New Project"
3. Импортируйте репозиторий `mixcart-clone`
4. Vercel автоматически обнаружит Next.js
5. Добавьте переменную окружения:
   - `NEXT_PUBLIC_CONVEX_URL` = `https://dazzling-dog-988.convex.cloud`
6. Нажмите "Deploy"

## 4. Готово!

Ваш проект будет развернут на Vercel и автоматически обновляться при каждом push в main ветку.

## Полезные команды

```bash
# Просмотр статуса
git status

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Отправить на GitHub
git push

# Получить обновления
git pull
```
