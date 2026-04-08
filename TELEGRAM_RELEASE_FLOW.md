# Telegram Release Flow

## Главный принцип

Telegram Mini App должен быть привязан к одному стабильному production URL на Vercel.

Пример:

`https://sporttrackerfresh-telegram-mini-app.vercel.app`

После этого новые релизы не требуют повторной настройки в BotFather, пока URL не меняется.

## Как обновления доходят в Telegram

Поток релиза:

1. Ты пушишь изменения в GitHub.
2. Vercel автоматически запускает новый production deployment.
3. Новый web build публикуется по тому же URL.
4. Telegram Mini App продолжает открываться по тому же адресу.
5. Пользователь видит уже новую версию приложения.

Итог:

- BotFather перенастраивать после каждого push не нужно
- Telegram автоматически получает обновленную версию по тому же URL

## Когда BotFather нужно трогать снова

Только если меняется сам production URL, например:

- переход на новый домен
- смена Vercel-проекта
- смена production environment URL

Во всех обычных релизах BotFather трогать не нужно.

## Рекомендуемый релизный цикл

### Безопасный production flow

1. Изменения разрабатываются в feature branch.
2. Локально проверяются:
   - `npm run typecheck`
   - `npx expo export --platform web`
3. Изменения попадают в `main`.
4. Push в `main`.
5. Vercel пересобирает production deployment.
6. Telegram Mini App обновляется автоматически.

## Safe release checklist перед push

- `npm run typecheck` проходит
- `npx expo export --platform web` проходит
- `dist` не коммитится в репозиторий
- `node_modules` не попал в git
- `vercel.json` на месте
- Telegram SDK bootstrap не сломан
- нижние sticky bars корректны в web/mobile layout
- refresh на внутренних экранах не ломается
- основные сценарии работают:
  - тренировки
  - readiness
  - история
  - питание
  - активность

## Рекомендуемый production check после deploy

После нового deploy проверь:

1. Открытие production URL в обычном браузере
2. Открытие Mini App внутри Telegram
3. Инициализацию Telegram user bootstrap
4. Тему / safe area / sticky footer
5. Переходы между вкладками
6. Сценарий сохранения тренировки

## Rollback стратегия

Если новый deploy оказался неудачным:

1. Открой проект в Vercel
2. Зайди в список Deployments
3. Найди последнюю стабильную сборку
4. Используй `Promote to Production` / rollback на предыдущий deployment

Плюс при необходимости:

- исправь баг в GitHub
- сделай новый push
- Vercel выпустит исправленный deploy

## Практическая рекомендация

Для Telegram Mini App лучше считать:

- `main` = единственный production source of truth
- Vercel production URL = постоянный URL для BotFather

Это самый простой и устойчивый релизный контур.
