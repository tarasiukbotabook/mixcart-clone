# Развертывание на Vercel

Проект готов к развертыванию на Vercel. Есть два способа:

## Способ 1: Через веб-интерфейс (Рекомендуется)

1. Перейдите на https://vercel.com/new
2. Импортируйте репозиторий `mixcart-clone`
3. Vercel автоматически обнаружит Next.js
4. В разделе "Environment Variables" добавьте:
   - **Key**: `NEXT_PUBLIC_CONVEX_URL`
   - **Value**: `https://dazzling-dog-988.convex.cloud`
5. Нажмите "Deploy"

## Способ 2: Через Vercel CLI

```bash
# Авторизуйтесь в Vercel
vercel login

# Разверните проект
vercel --prod
```

При первом развертывании Vercel попросит подтвердить переменные окружения.

## Автоматическое развертывание

После первого развертывания, каждый push в `main` ветку будет автоматически развертываться на Vercel.

## Ссылка на репозиторий

https://github.com/tarasiukbotabook/mixcart-clone
