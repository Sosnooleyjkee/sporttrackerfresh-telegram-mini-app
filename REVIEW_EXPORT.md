# REVIEW_EXPORT

## Назначение
Этот документ помогает подготовить проект `SportTrackerFresh` к внешнему code review и собрать чистый ZIP-архив без тяжелых, сгенерированных и служебных файлов.

Рецензенту в первую очередь нужны:
- архитектура приложения
- экраны и UI
- переиспользуемые компоненты
- state management
- сервисы и бизнес-логика
- конфигурация проекта и зависимости

---

## Краткая структура проекта

### Корень проекта
- `App.tsx` — точка входа приложения
- `app.json` — Expo-конфигурация
- `package.json` — зависимости и npm-скрипты
- `package-lock.json` — lockfile для воспроизводимой установки
- `babel.config.js` — Babel / module resolver
- `tsconfig.json` — TypeScript-конфигурация
- `README.md` — общее описание проекта
- `DESIGN.md` — дизайн-направление проекта

### Основной код
- `src/components` — базовые UI-компоненты и формы
- `src/constants` — шаблоны, справочники, статические каталоги
- `src/core` — bootstrap и корневая композиция приложения
- `src/db` — SQLite-схема, миграции, DB-утилиты
- `src/domain` — доменные модели и типы
- `src/features` — feature-level экраны и UI-модули
- `src/navigation` — навигация приложения
- `src/services` — бизнес-логика, движки расчета, health/nutrition/workout сервисы
- `src/store` — Zustand store
- `src/theme` — тема и дизайн-токены
- `src/utils` — утилиты

### Документация и ассеты
- `docs/MVP_ARCHITECTURE.md` — архитектурный документ
- `assets/techniques` — медиа и изображения для техник упражнений

---

## Что является ядром для review

Для внешнего review в этом проекте ключевые папки и файлы:

- `src/`
- `assets/`
- `docs/MVP_ARCHITECTURE.md`
- `App.tsx`
- `app.json`
- `package.json`
- `package-lock.json`
- `babel.config.js`
- `tsconfig.json`
- `README.md`
- `DESIGN.md`
- `.gitignore`

Именно этого набора достаточно, чтобы reviewer понял:
- архитектуру
- организацию экранов
- бизнес-логику
- схемы данных
- зависимости
- направление дизайна

---

## Что включать в ZIP-архив

### Обязательно включить
- `src/`
- `assets/`
- `docs/`
- `App.tsx`
- `app.json`
- `package.json`
- `package-lock.json`
- `babel.config.js`
- `tsconfig.json`
- `README.md`
- `DESIGN.md`
- `.gitignore`
- `REVIEW_EXPORT.md`

### Можно включить дополнительно
Только если reviewer должен уметь быстро открыть web-preview локально:
- `preview-server.cjs`
- `start-real-preview.bat`
- `start-real-preview.ps1`
- `sync-real-preview.bat`
- `sync-real-preview.ps1`

Если review только про код, эти файлы можно не добавлять.

---

## Что исключать из ZIP-архива

### Обязательно исключить
- `node_modules/`
- `.expo/`
- `dist/`

### Исключить как generated / cache / runtime мусор
- `preview-out.log`
- `preview-err.log`
- `server.log`

### Исключить как вспомогательное локальное preview/demo
Если reviewer не просил именно HTML-preview:
- `workouts-preview.html`
- `start-html-preview.bat`
- `start-web.bat`
- `start-expo.bat`

### Общие категории, которые не стоит отправлять
- build artifacts
- export output
- кэш-папки
- временные логи
- локальные runtime-файлы

---

## Практический include/exclude для этого проекта

### Include
- `src`
- `assets`
- `docs`
- `App.tsx`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `README.md`
- `app.json`
- `babel.config.js`
- `DESIGN.md`
- `.gitignore`
- `REVIEW_EXPORT.md`

### Exclude
- `node_modules`
- `.expo`
- `dist`
- `preview-out.log`
- `preview-err.log`
- `server.log`

### Обычно не нужны для code review
- `workouts-preview.html`
- `start-expo.bat`
- `start-web.bat`
- `start-html-preview.bat`

---

## Рекомендуемый формат имени архива

Используй такой шаблон:

`SportTrackerFresh_review_YYYY-MM-DD.zip`

Пример:

`SportTrackerFresh_review_2026-04-08.zip`

---

## Как создать ZIP на Windows

### Вариант 1. Через Проводник
1. Открой папку проекта `SportTrackerFresh`.
2. Убедись, что архивируешь только нужные файлы и папки из списка include.
3. Не выделяй:
   - `node_modules`
   - `.expo`
   - `dist`
   - `.log` файлы
4. Выдели нужные папки и файлы.
5. Нажми правой кнопкой мыши.
6. Выбери `Отправить -> Сжатая ZIP-папка` или `Compress to ZIP file` в зависимости от версии Windows.
7. Переименуй архив в:
   - `SportTrackerFresh_review_2026-04-08.zip`

### Вариант 2. Через отдельную review-папку
Этот вариант самый аккуратный.

1. Создай рядом временную папку, например:
   - `SportTrackerFresh_review_export`
2. Скопируй в неё только:
   - `src`
   - `assets`
   - `docs`
   - `App.tsx`
   - `app.json`
   - `package.json`
   - `package-lock.json`
   - `babel.config.js`
   - `tsconfig.json`
   - `README.md`
   - `DESIGN.md`
   - `.gitignore`
   - `REVIEW_EXPORT.md`
3. Проверь, что в этой папке нет:
   - `node_modules`
   - `.expo`
   - `dist`
   - `.log`
4. Заархивируй уже эту чистую папку.

Этот способ снижает риск случайно отправить лишнее.

---

## Короткий чеклист перед отправкой

- Проверить, что `node_modules` не попал в архив.
- Проверить, что `.expo` не попал в архив.
- Проверить, что `dist` не попал в архив.
- Проверить, что `.log` файлы не попали в архив.
- Проверить, что в архиве есть `src`.
- Проверить, что в архиве есть `assets`.
- Проверить, что в архиве есть `package.json`.
- Проверить, что в архиве есть `app.json`, `tsconfig.json`, `babel.config.js`.
- Проверить, что в архиве есть `docs/MVP_ARCHITECTURE.md`.
- Проверить, что размер архива выглядит разумно для code review.

---

## Рекомендации именно для этого проекта

1. Для review этого приложения достаточно исходников и конфигурации. Отправлять локально собранный web-output (`dist`) не нужно.
2. Папка `assets/techniques` полезна, потому что она связана с workout UX и техникой упражнений.
3. `docs/MVP_ARCHITECTURE.md` лучше включить обязательно: он ускорит понимание доменной модели и направления проекта.
4. `package-lock.json` лучше не удалять из review-архива: reviewer сможет быстрее поднять проект в воспроизводимом виде.
5. `preview-server.cjs` и preview-скрипты включай только если reviewer прямо хочет запускать локальный web-preview.
6. Если перед отправкой будет время, стоит отдельно глазами проверить `README.md`, потому что в текущем проекте текст может быть сохранен в некорректной кодировке. Для review это не критично, но выглядит менее аккуратно.
