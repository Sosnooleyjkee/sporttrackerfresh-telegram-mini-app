# GitHub Push Steps

## Что уже подготовлено

- Локальный Git-репозиторий инициализирован.
- Основная ветка: `main`.
- В `.gitignore` исключены тяжелые, локальные и сгенерированные артефакты.
- В проекте уже есть production-safe web export script:
  - `npx expo export --platform web`
- Конфигурация Vercel готова для SPA-маршрутизации Telegram Mini App.

## Рекомендуемое имя GitHub-репозитория

`sporttrackerfresh-telegram-mini-app`

Короткий альтернативный вариант:

`sporttrackerfresh`

## Как создать GitHub-репозиторий

1. Открой GitHub и нажми `New repository`.
2. Введи имя репозитория:
   - `sporttrackerfresh-telegram-mini-app`
3. Выбери `Private` или `Public` по задаче ревью/релиза.
4. Не добавляй `README`, `.gitignore` и `license`, чтобы не создавать лишний merge при первом push.
5. Создай репозиторий.

## Как подключить remote

В терминале из корня проекта выполни:

```powershell
cd "C:\Users\Pc\Documents\SportTrackerFresh"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/sporttrackerfresh-telegram-mini-app.git
```

Проверка:

```powershell
git remote -v
```

## Как отправить первый push

```powershell
cd "C:\Users\Pc\Documents\SportTrackerFresh"
git push -u origin main
```

Если GitHub попросит авторизацию:

- используй Git Credential Manager / встроенный login
- либо Personal Access Token вместо пароля

## Рекомендуемый workflow для следующих изменений

Для быстрой Telegram/Vercel-доставки:

- `main` — продакшн ветка
- каждый push в `main` автоматически инициирует новый production deployment на Vercel

Для более безопасной разработки:

- `main` — production
- `develop` — рабочая интеграция
- `feat/...` — фичевые ветки
- `release/...` — предрелизная стабилизация

Минимально рекомендуемый naming:

- `feat/history-analytics`
- `feat/telegram-payments`
- `fix/webview-safe-area`
- `release/2026-04-telegram-launch`

## Релизный поток для Telegram Mini App

Рекомендуемый production flow:

1. Внести изменения в feature branch.
2. Проверить локально:
   - `npm run typecheck`
   - `npx expo export --platform web`
3. Слить изменения в `main`.
4. Push в `main`.
5. Vercel автоматически соберет новый `dist`.
6. Telegram Mini App по прежнему URL сразу начнет открывать новую версию.

## Ежедневный рабочий цикл

```powershell
git checkout main
git pull
git checkout -b feat/<feature-name>
```

После завершения:

```powershell
git add .
git commit -m "feat: <short description>"
git push -u origin feat/<feature-name>
```

Дальше:

- создаешь Pull Request в GitHub
- после merge в `main` Vercel сам задеплоит обновление

## Быстрый чек перед push

- `node_modules`, `dist`, `.expo`, логи не попали в индекс
- `package-lock.json` актуален
- `vercel.json` не удален
- Telegram SDK интеграция не сломана
- `npm run typecheck` проходит
- `npx expo export --platform web` собирается без ошибок
