# Vercel Import Steps

## Цель

Настроить Vercel так, чтобы каждый новый push в GitHub автоматически пересобирал Expo web build и обновлял Telegram Mini App по тому же URL.

## Что импортировать

Импортируется корень проекта:

`C:\Users\Pc\Documents\SportTrackerFresh`

## Рекомендуемый способ подключения

1. Открой [Vercel](https://vercel.com/).
2. Нажми `Add New Project`.
3. Подключи GitHub-аккаунт, если он еще не подключен.
4. Выбери репозиторий:
   - `sporttrackerfresh-telegram-mini-app`

## Точные настройки при импорте

### Framework Preset

Выбери:

`Other`

### Root Directory

Оставь:

`project root`

### Build Command

Укажи:

```bash
npx expo export --platform web
```

### Output Directory

Укажи:

```bash
dist
```

### Install Command

Можно оставить автоопределение, либо явно:

```bash
npm install
```

## Почему это корректно для Expo web

- Expo собирает production web bundle в `dist`
- Vercel раздает `dist` как статический сайт
- `vercel.json` уже настроен для SPA fallback
- refresh на внутренних экранах не будет давать 404
- deep links Telegram Mini App будут резолвиться в `index.html`

## Production domain

После первого деплоя Vercel выдаст production URL вида:

`https://sporttrackerfresh-telegram-mini-app.vercel.app`

Рекомендуется:

- использовать именно один стабильный production URL в BotFather
- не переключать URL между деплоями
- при желании позже привязать собственный домен

## Как это работает для Telegram Mini App

Telegram Mini App открывается по одному и тому же URL.

После каждого нового production deploy:

- URL остается тем же
- содержимое обновляется на стороне Vercel
- Telegram открывает уже новую версию приложения

То есть после первого правильного подключения в BotFather повторно менять URL не нужно.

## Что проверить после первого import

1. Build завершился успешно.
2. Открывается главная страница приложения.
3. Работают клиентские переходы между вкладками.
4. Прямой refresh на внутреннем маршруте не ломается.
5. Telegram Mini App открывается внутри WebView без layout-проблем.

## Рекомендуемые project settings в Vercel

- Production Branch:
  - `main`
- Auto Deploy:
  - `enabled`

## Локальная проверка перед push

```powershell
cd "C:\Users\Pc\Documents\SportTrackerFresh"
npm.cmd run typecheck
npx.cmd expo export --platform web
```

Если обе команды проходят, Vercel с высокой вероятностью соберет проект без сюрпризов.
