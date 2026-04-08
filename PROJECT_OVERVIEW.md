# PROJECT OVERVIEW

## 1. Обзор проекта

`SportTrackerFresh` — мобильное fitness/health приложение на `React Native + Expo + TypeScript` с тремя основными продуктными вертикалями:

- тренировки
- дневная активность
- питание

Текущая архитектура уже вышла за пределы простого MVP-логгера и движется в сторону адаптивного coaching engine:

- есть readiness-check перед тренировкой
- есть рекомендованный режим дня и load adjustment
- есть per-set workout flow
- есть always-save логика
- есть reward layer после сохранения
- есть foundation под white-label coach/client модель

При этом приложение пока остается локальным single-client приложением без облачной синхронизации и без полноценного production persistence слоя для всех runtime-сущностей.

---

## 2. Project Tree

Ниже показано только релевантное дерево проекта без generated/cache артефактов.

```text
SportTrackerFresh/
├─ assets/
│  └─ techniques/
│     └─ ...
├─ docs/
│  └─ MVP_ARCHITECTURE.md
├─ src/
│  ├─ components/
│  │  ├─ MetricCard.tsx
│  │  ├─ Screen.tsx
│  │  ├─ forms/
│  │  │  └─ FormNumberInput.tsx
│  │  └─ ui/
│  │     ├─ PrimaryButton.tsx
│  │     └─ SectionCard.tsx
│  ├─ constants/
│  │  ├─ exerciseTechniques.ts
│  │  ├─ foodCatalog.ts
│  │  └─ workoutTemplates.ts
│  ├─ core/
│  │  ├─ AppBootstrap.tsx
│  │  └─ AppRoot.tsx
│  ├─ db/
│  │  ├─ migrations.ts
│  │  ├─ schema.ts
│  │  └─ sqlite.ts
│  ├─ domain/
│  │  ├─ activity.ts
│  │  ├─ common.ts
│  │  ├─ nutrition.ts
│  │  ├─ onboarding.ts
│  │  ├─ whitelabel.ts
│  │  └─ workout.ts
│  ├─ features/
│  │  ├─ activity/
│  │  │  ├─ ActivityScreen.tsx
│  │  │  └─ ActivityWidgets.tsx
│  │  ├─ dashboard/
│  │  ├─ nutrition/
│  │  │  ├─ NutritionScreen.tsx
│  │  │  └─ NutritionWidgets.tsx
│  │  ├─ onboarding/
│  │  │  └─ OnboardingScreen.tsx
│  │  ├─ profile/
│  │  └─ workouts/
│  │     ├─ WorkoutsScreen.tsx
│  │     └─ WorkoutWidgets.tsx
│  ├─ navigation/
│  │  ├─ MainTabs.tsx
│  │  └─ RootNavigator.tsx
│  ├─ services/
│  │  ├─ health/
│  │  │  └─ healthAdapters.ts
│  │  ├─ nutrition/
│  │  │  └─ nutritionEngine.ts
│  │  └─ workouts/
│  │     └─ workoutEngine.ts
│  ├─ store/
│  │  └─ useAppStore.ts
│  ├─ theme/
│  │  └─ appTheme.ts
│  ├─ types/
│  └─ utils/
│     ├─ date.ts
│     └─ format.ts
├─ App.tsx
├─ app.json
├─ babel.config.js
├─ DESIGN.md
├─ package.json
├─ README.md
└─ tsconfig.json
```

### Структурные наблюдения

- `src/domain` — типы и продуктные модели
- `src/services` — бизнес-движки и вычислительная логика
- `src/features` — feature-oriented UI слои
- `src/store` — единый глобальный Zustand store
- `src/db` — локальная SQLite foundation
- `src/constants` — seed-данные, шаблоны и каталоги
- `src/navigation` — root flow и tab navigation

Папки `features/dashboard`, `features/profile` и `src/types` уже зарезервированы под дальнейший рост, но в текущем runtime flow практически не используются.

---

## 3. Screen Map

### 3.1 Root Navigation Flow

Фактический flow приложения:

```text
App.tsx
→ AppRoot
→ AppBootstrap
→ RootNavigator
   ├─ OnboardingScreen (если questionnaire.isCompleted === false)
   └─ MainTabs (если onboarding завершен)
      ├─ WorkoutsScreen
      ├─ ActivityScreen
      └─ NutritionScreen
```

### 3.2 Экранная карта

#### OnboardingScreen

Назначение:

- обязательная анкета пользователя
- сбор базовых health/fitness параметров
- первичная настройка nutrition targets
- закрытие onboarding gate

После сохранения анкеты:

- `questionnaire.isCompleted = true`
- обновляется `nutritionPlan`
- обновляется `client.goal`
- следующий запуск приложения ведет уже в `MainTabs`

#### WorkoutsScreen

Назначение:

- основной тренировочный сценарий
- multi-direction workout day
- readiness mini-check
- coaching recommendation card
- per-set exercise tracking
- collapse completed exercise flow
- always-save workout
- reward modal после сохранения

Это главный продуктный экран и самый сложный orchestration layer в проекте.

#### ActivityScreen

Назначение:

- сводка активности за день
- шаги
- активные минуты
- быстрый лог активности по типам
- breakdown по activity categories
- статус интеграций Apple Health / Google Fit

#### NutritionScreen

Назначение:

- nutrition dashboard за день
- дневная сводка КБЖУ
- поиск по food catalog
- quick add еды в meal slot
- suggested meals / menu suggestions

### 3.3 Product Journey

#### Workout Flow

```text
Открыть Workouts
→ пройти readiness mini-check
→ получить coaching recommendation
→ выбрать направления/мышечные блоки
→ пройти упражнения по подходам
→ завершать упражнения по одному
→ свернуть completed cards
→ сохранить workout
→ получить reward modal
→ session попадает в history + обновляет PR/state
```

#### Readiness Flow

```text
Readiness form
→ readiness score
→ readiness mode
→ coaching snapshot
→ suggested load adjustment
→ optional substitutions
→ применяется к текущему workout draft
```

#### Save Workout Flow

```text
Workout draft
→ analyzeWorkoutDraft()
→ buildWorkoutResult()
→ always-save
→ session status
→ reward
→ update records
→ prepend to workoutHistory
→ update clientProgress
```

#### Activity Flow

```text
Открыть Activity
→ увидеть шаги / активные минуты
→ выбрать тип активности
→ выбрать duration preset
→ logActivityMinutes()
→ обновляется DailyActivity за today
→ breakdown пересчитывается из state
```

#### Nutrition Flow

```text
Открыть Nutrition
→ увидеть totals / targets
→ искать продукт
→ применить фильтры / сортировку
→ quick add в Breakfast / Lunch / Dinner / Snack
→ addFoodLogEntry()
→ summary recalculated
→ suggested meals можно добавить батчем
```

#### History / Analytics Flow

Отдельного экрана истории или аналитики в текущей навигации нет.

Сейчас history/analytics существует как backend-for-UI слой внутри workout engine:

- `workoutHistory` хранится в Zustand
- readiness suggestions опираются на прошлые сессии
- progression engine сравнивает с историей
- weekly quest строится поверх rolling median из последних сессий
- PR обновляется на основе saved sessions

То есть история уже участвует в продукте, но не оформлена в отдельный аналитический UX-экран.

---

## 4. Business Logic Map

Ниже перечислены основные pipeline-слои и их владельцы.

### 4.1 Always-Save Flow

Ответственность:

- `src/services/workouts/workoutEngine.ts`
- `src/store/useAppStore.ts`

Текущая логика:

- старый hard gate `save only if +3% total volume` снят
- `buildWorkoutResult()` всегда возвращает `saved: true`
- workout log теперь является source of truth

Pipeline:

```text
WorkoutsScreen
→ saveWorkout(payload)
→ buildWorkoutResult(...)
→ session assembled
→ reward resolved
→ records updated
→ history updated
```

### 4.2 Progression Engine

Ответственность:

- `src/services/workouts/workoutEngine.ts`

Основные пути прогрессии:

- `strength`
- `volume`
- `weekly_quest`
- `maintenance`
- `recovery`

Что анализируется:

- лучший сет
- прирост веса при тех же/лучших повторениях
- прирост повторений при том же весе
- полезный объем упражнения
- число hard sets
- rolling median baseline по группе

Основные функции:

- `detectStrengthPath`
- `detectVolumePath`
- `buildDirectionResult`
- `resolveSessionStatus`
- `buildReward`
- `analyzeWorkoutDraft`

### 4.3 Readiness Scoring

Ответственность:

- `src/services/workouts/workoutEngine.ts`
- модель: `src/domain/workout.ts`

Источник данных:

- `ReadinessCheck`
  - sleepQuality
  - energyLevel
  - muscleSoreness
  - stress
  - readinessToPush

Функции:

- `calculateReadinessScore`
- `buildReadinessProfile`

Результат:

- `score: 0..100`
- `mode: pr_day | progress | maintenance | recovery`
- `loadMultiplier`
- `label`

### 4.4 Weight Auto-Suggestion

Ответственность:

- `src/services/workouts/workoutEngine.ts`

Ключевые функции:

- `getSuggestedTopSet`
- `getRecommendedWorkingWeight`

Источники:

- прошлые workout sessions
- best sets последних совпадающих упражнений
- readiness multiplier из coaching config

### 4.5 Exercise Substitution

Ответственность:

- `src/services/workouts/workoutEngine.ts`

Ключевой механизм:

- `LOW_READINESS_SUBSTITUTIONS`
- `getExerciseSubstitution`

Назначение:

- на low-readiness днях предлагать более щадящие эквиваленты
- не менять muscle split
- менять только конкретное упражнение внутри выбранного workout day

### 4.6 Completed Exercise Collapsing

Ответственность:

- UI orchestration: `src/features/workouts/WorkoutsScreen.tsx`
- volume ownership: `src/services/workouts/workoutEngine.ts`

Логика:

- упражнение отмечается как выполненное
- большая карточка сворачивается в компактную строку
- completed exercise остается видимым
- по тапу раскрывается обратно и остается редактируемым

### 4.7 Weekly Quest Logic

Ответственность:

- `src/services/workouts/workoutEngine.ts`

Логика:

- берутся последние до 3 session volumes по группе
- вычисляется rolling median
- quest target = baseline * `1.03`
- выполнение quest не блокирует сохранение, а служит как reward/gamification path

### 4.8 Reward Modal Logic

Ответственность:

- статус/контент: `src/services/workouts/workoutEngine.ts`
- показ модалки: `src/features/workouts/WorkoutsScreen.tsx`

Статусы reward:

- `Strength PR`
- `Volume PR`
- `Weekly Quest Complete`
- `Maintenance`
- `Recovery`
- `Progress`

### 4.9 History Persistence

Фактическая текущая реализация:

- runtime history хранится в Zustand store (`workoutHistory`)
- PR хранится в store (`personalRecords`)
- progress snapshots хранятся в store (`clientProgress`)

SQLite слой:

- существует schema foundation в `src/db`
- но runtime workout engine ушел вперед относительно схемы persistence

Вывод:

- история фактически работает как in-memory app history
- локальный DB contract подготовлен, но пока не является полнофункциональным persistence owner для новой coaching-модели

---

## 5. State Flow

### 5.1 Глобальное состояние

Единый store:

- `src/store/useAppStore.ts`

Store содержит:

- bootstrap state
- onboarding questionnaire
- selected workout directions
- readiness check
- workout history
- personal records
- daily activities
- food log entries
- health connections
- coach/client/training/nutrition foundation
- clientProgress

### 5.2 Local Component State

Самый насыщенный локальный state находится в `WorkoutsScreen.tsx`.

Примеры:

- текущее раскрытое упражнение
- активная техника / active technique frame
- reward modal visibility
- replacement modal context
- coaching decision UI state
- UX feedback state

Также локальный UI state активно используется в:

- `ActivityScreen.tsx`
- `NutritionScreen.tsx`

### 5.3 Form State

Workout screen использует `react-hook-form` для workout draft.

Это важное архитектурное разделение:

- form state держит черновик текущей сессии
- Zustand store держит app-level persisted/runtime state
- services считают derived analytics поверх текущего draft и history

### 5.4 Persisted / Semi-Persisted State

На текущий момент:

- SQLite инициализируется через `AppBootstrap`
- schema tables существуют
- seed/tables готовы для локального storage

Но критично:

- основной coaching/session state пока живет прежде всего в store, а не в реально используемом repository layer

### 5.5 Derived State

Основные derived значения:

- workout summary stats
- group volume
- exercise volume
- best set
- progression paths
- readiness mode
- recommended load
- today nutrition summary
- activity breakdown

Источники derived logic:

- `src/services/workouts/workoutEngine.ts`
- `src/services/nutrition/nutritionEngine.ts`
- screen-level selectors/transformers

### 5.6 Где state boundaries становятся сложными

Основные зоны сложности:

1. `WorkoutsScreen.tsx`
- одновременно управляет form state, modal state, derived analytics и UI focus flow

2. `useAppStore.ts`
- один store держит и app bootstrapping, и domain state, и white-label foundation

3. DB vs runtime model
- SQLite schema и current workout runtime model частично расходятся

4. Session analysis ownership
- часть аналитики живет в service layer правильно
- но orchestration и local mutations плотно сидят в одном экране

---

## 6. Data Models

Ниже перечислены ключевые модели, которые важны для review.

### 6.1 Workout Session

Файл:

- `src/domain/workout.ts`

Ключевая сущность:

- `WorkoutSession`

Содержит:

- `id`
- `directions`
- `performedAt`
- `readinessCheck`
- `readinessScore`
- `suggestedMode`
- `coachingSnapshot`
- `status`
- `activePaths`
- `blocks`

### 6.2 Exercise

Модели:

- `ExerciseTemplate`
- `WorkoutExerciseInput`
- `WorkoutExerciseEntry`

Роли:

- `ExerciseTemplate` — каталожный шаблон
- `WorkoutExerciseInput` — editable draft exercise
- `WorkoutExerciseEntry` — enriched analyzed exercise с volume/bestSet

### 6.3 Exercise Set

Модели:

- `WorkoutSetInput`
- `WorkoutSetEntry`

Содержат:

- `id`
- `weight`
- `reps`
- `type: normal | warmup`
- `isCompleted`
- `volume` для enriched варианта

### 6.4 Readiness Check

Модель:

- `ReadinessCheck`

Поля:

- `sleepQuality`
- `energyLevel`
- `muscleSoreness`
- `stress`
- `readinessToPush`

### 6.5 Progression Result

Прямой отдельной сущности `ProgressionResult` нет, но результат progression engine материализуется через:

- `WorkoutDirectionResult`
- `WorkoutSession.activePaths`
- `WorkoutSession.status`
- `WorkoutCoachingSnapshot`

### 6.6 Reward Result

Модели:

- `WorkoutReward`
- `WorkoutSaveResult`

`WorkoutSaveResult` включает:

- `saved`
- `reason`
- `session`
- `updatedRecords`
- `failedDirections`
- `reward`

### 6.7 Quest State

Отдельной entity для quest пока нет.

Сейчас quest state embedded внутрь:

- `WorkoutDirectionResult.rollingQuestBaseline`
- `WorkoutDirectionResult.isQuestCompleted`
- `WorkoutDirectionResult.progressThreshold`

Это рабочая модель для MVP+/coaching engine, но при росте gamification лучше выделять quest в отдельную domain entity.

### 6.8 History Entry

Фактически history entry = `WorkoutSession`.

Для nutrition:

- `FoodLogEntry`

Для activity:

- `DailyActivity`

Для client progress:

- `ClientProgress`

### 6.9 User Profile

Модели:

- `UserQuestionnaire`
- `Client`
- `NutritionPlan`
- `TrainingPlan`

### 6.10 Coach-Ready Future Entities

Файл:

- `src/domain/whitelabel.ts`

Уже есть foundation:

- `Coach`
- `Client`
- `TrainingPlan`
- `NutritionPlan`
- `ClientProgress`

Это хороший задел под будущий coach SaaS / white-label слой.

---

## 7. Workout Lifecycle

Это центральный lifecycle продукта.

### Шаг 1. Открытие приложения

```text
App.tsx
→ AppRoot
→ AppBootstrap
→ initializeDatabase()
→ RootNavigator
```

На этом этапе:

- поднимается локальная SQLite foundation
- приложение решает, показать onboarding или main app

### Шаг 2. Onboarding Gate

Если анкета не завершена:

```text
RootNavigator
→ OnboardingScreen
→ completeQuestionnaire()
→ questionnaire.isCompleted = true
```

Побочный эффект:

- nutrition targets пересчитываются под пользователя

### Шаг 3. Вход на Workouts Screen

После onboarding пользователь попадает в табы и может открыть `WorkoutsScreen`.

На старте экрана:

- подтягиваются выбранные направления
- строятся template blocks
- поднимается workout draft
- readiness state монтируется в form flow

### Шаг 4. Readiness Check

Пользователь заполняет ultra-short readiness mini-check:

- sleep
- energy
- soreness
- stress
- readiness to push

Дальше:

```text
ReadinessCheck
→ calculateReadinessScore()
→ buildReadinessProfile()
```

На выходе:

- readiness score
- suggested mode
- load multiplier
- coaching label

### Шаг 5. Smart Recommendation

На основе readiness + history:

```text
buildCoachingSnapshot()
→ recommended set delta
→ recommended working weights
→ optional substitutions
```

UI показывает coaching card:

- readiness score
- suggested mode
- load advice
- substitutions if needed

Пользователь может:

- принять рекомендацию
- оставить исходный план

### Шаг 6. Exercise Execution

Внутри каждого блока направления:

- у упражнения есть header
- есть per-set rows
- есть replace/technique actions

Каждый set поддерживает:

- вес
- повторы
- тип сета
- completion state
- delete

Объем теперь считается как:

```text
exerciseVolume = sum(weight * reps) for counted sets
```

Warm-up sets по умолчанию не входят в counted volume.

### Шаг 7. Complete Exercise

Когда пользователь завершает упражнение:

- exercise mark as completed
- full card collapse
- остается compact completed summary
- упражнение можно снова раскрыть и отредактировать

Это ключевой UX-механизм снижения visual overload во время тренировки.

### Шаг 8. Auto-Focus Next Exercise

После completion:

- следующий unfinished exercise становится следующим визуальным фокусом
- экран постепенно очищается по мере завершения сессии

Это создает guided-workout flow вместо статической формы.

### Шаг 9. Save Workout

После завершения части или всей сессии пользователь нажимает sticky save CTA.

Сценарий:

```text
current draft
→ analyzeWorkoutDraft()
→ buildWorkoutResult()
→ always save
```

Что считает движок:

- blockResults
- activePaths
- session status
- reward payload
- updated records

### Шаг 10. Progression Calculation

Внутри `buildWorkoutResult()`:

- определяется `strength path`
- определяется `volume path`
- определяется `weekly quest`
- если активных growth paths нет:
  - `maintenance` или `recovery`

### Шаг 11. Reward Modal

После save:

- показывается reward modal
- пользователь получает framing результата не как binary success/fail, а как coaching feedback

Это важный product shift:

- workout log больше не наказывается за “неидеальную” сессию
- каждая сессия получает meaningful interpretation

### Шаг 12. History Update

После сохранения store обновляется:

- `workoutHistory`
- `personalRecords`
- `readinessCheck`
- `clientProgress`

Именно здесь session становится source of truth для следующих recommendation cycles.

---

## 8. Extension Points

### 8.1 Telegram Mini App

Лучшие точки встраивания:

- `src/services/*` как shared business layer
- `src/domain/*` как общие модели
- `src/store/useAppStore.ts` как временный state source

Что потребуется:

- выделить repository/API слой отдельно от Zustand
- вынести use cases в более platform-agnostic слой
- сделать web-first shell для Telegram runtime

### 8.2 App Store Mobile Build

Уже близко по структуре.

Готовые точки:

- Expo foundation
- React Navigation
- feature-based screens
- SQLite bootstrap

Что желательно усилить:

- persistence consistency
- error handling
- offline/rehydration strategy
- analytics/crash reporting

### 8.3 White-Label Trainer Mode

Уже подготовлено через:

- `src/domain/whitelabel.ts`
- store fields `coach/client/trainingPlan/nutritionPlan/clientProgress`

Лучшие insertion points:

- расширить `Coach` настройками thresholds/rules
- отделить coach-config от user-config
- перевести substitution/load rules в configurable policy layer

### 8.4 Cloud Sync

Лучшие точки интеграции:

- поверх `saveWorkout`, `addFoodLogEntry`, `upsertDailyActivity`
- через repository abstraction между store и persistence

Сейчас cloud sync лучше вставлять не в screen layer, а между:

```text
UI
→ Store Action
→ Repository
→ Local DB / Remote API
```

### 8.5 Coach Dashboard

Лучшие источники данных уже есть:

- `workoutHistory`
- `clientProgress`
- `readinessCheck`
- `nutritionPlan`
- `dailyActivities`

Лучшее architectural направление:

- не тащить dashboard logic в mobile UI
- выделить read-model/query layer поверх session history

### 8.6 Wearable Integrations

Наиболее чистая текущая точка:

- `src/services/health/healthAdapters.ts`

Сейчас это declarative stub layer, который можно развивать в:

- adapter contracts
- provider-specific sync services
- permissions/status UI

### 8.7 Apple Health / Google Fit

Готовая заготовка:

- `HealthAdapter`
- `HealthConnection`
- `healthConnections` в store
- integration cards в Activity UI

Что нужно дальше:

- permission orchestration
- sync timestamps
- conflict resolution with manual activity logs

### 8.8 AI Coaching Layer

Лучшие insertion points:

- `workoutEngine.ts`
- future coach policy layer
- readiness + history + nutrition + activity aggregated context

Наиболее естественные сценарии:

- adaptive deload suggestions
- weekly planning recommendations
- recovery warnings
- auto-generated coach summaries

---

## 9. Risk Analysis

### 9.1 Oversized Components

Главный риск:

- `src/features/workouts/WorkoutsScreen.tsx`

Проблема:

- экран совмещает orchestration, form logic, recommendation application, modal coordination и complex rendering

Риск:

- рост стоимости изменений
- сложность тестирования
- высокий шанс регрессий в UX-flow

### 9.2 Duplicated / Embedded Logic

Сейчас основной business logic хорошо сидит в `workoutEngine.ts`, но часть сценарной логики still embedded in screen-level orchestration.

Риск:

- сложнее переиспользовать flow в web/coach/admin contexts

### 9.3 Service Coupling

`workoutEngine.ts` стал мощным и ценным центром доменной логики, но:

- readiness
- progression
- recommendation
- substitution
- reward framing

собраны в одном service file.

Это удобно на текущем этапе, но может стать bottleneck при усложнении AI/coach rules.

### 9.4 Weak Store Boundaries

`useAppStore.ts` — единый store на все.

Плюсы:

- простота
- низкий overhead

Риски:

- домены начинают пересекаться
- white-label, nutrition, activity и workout scale идут в один контейнер
- труднее вводить selective persistence / sync policies

### 9.5 Persistence Mismatch

Сильный технический риск:

- runtime workout model уже работает с set-level tracking, readiness/coaching/session analytics
- SQLite schema выглядит старее и ближе к прошлой версии модели

Следствие:

- архитектурно persistence contract отстает от runtime truth
- при переходе к real local persistence может появиться migration debt

### 9.6 Performance Risks

Потенциальные риски:

- linear scans по `workoutHistory`
- repeated flatten/filter/reduce across full session history
- expensive derived calculations inside screen render cycles при росте истории

Пока это приемлемо для локального MVP+, но плохо масштабируется без memoized selectors/query layer.

### 9.7 History Scaling

Сейчас history используется как live analytical input.

Риск:

- чем больше сессий, тем больше derived scans
- отсутствие отдельного history repository/query API осложнит дальнейший рост

### 9.8 White-Label Risks

White-label foundation есть, но:

- policy layer еще не отделен
- coach-config не выделен как first-class entity
- substitution/readiness/load rules пока hardcoded

Риск:

- будущий SaaS coach mode будет требовать существенного выделения конфигурации из `workoutEngine.ts`

### 9.9 Recommendation Engine Risks

Текущий engine pragmatic и usable, но основан на heuristics:

- rolling scans
- static substitution map
- fixed readiness multipliers
- rule-based labels

Это сильная MVP/early product база, но не полноценный configurable recommendation platform.

---

## 10. Review Summary

### 10.1 Strongest Architectural Decisions

Самые сильные решения:

1. Четкое разделение `domain / services / features / store`
2. Feature-oriented экранная структура вместо хаотичного screen dump
3. Централизация тренировочной логики в `workoutEngine.ts`
4. Typed domain models через `TypeScript + Zod`
5. Переход от hard-gate логики к always-save coaching model
6. Уже заложенная white-label foundation

### 10.2 Weakest Technical Areas

Самые слабые места:

1. oversized `WorkoutsScreen.tsx`
2. монолитный Zustand store
3. рассинхрон runtime model и SQLite schema
4. отсутствие выделенного repository/query layer
5. history analytics без отдельного optimized read model

### 10.3 Best Scaling Opportunities

Самые перспективные точки роста:

1. вынести persistence в repository layer
2. отделить coach policy/config engine от runtime workout engine
3. выделить history analytics в query/service слой
4. запустить отдельный history / analytics screen
5. расширить health integrations через adapter layer

### 10.4 Best Monetization-Ready Modules

Наиболее monetization-ready модули:

1. adaptive workout coaching
2. readiness-based training recommendations
3. nutrition planning + quick logging
4. premium recovery / quest / reward framing
5. white-label coach-client foundation

### 10.5 Best Coach SaaS Opportunities

Наиболее сильные SaaS-направления:

1. coach-configurable readiness thresholds
2. adjustable substitution / load rules
3. client readiness trends
4. coach review of workout sessions and PR history
5. coach-assigned weekly quests and nutrition targets

---

## Итог

Текущая архитектура уже выглядит как крепкая product foundation для premium fitness app, а не как разрозненный демо-проект.

Главные достоинства:

- логика домена уже достаточно зрелая
- coaching engine уже встроен в core workout loop
- UI-слои организованы по feature-направлениям
- есть правильные заделы под health sync и white-label expansion

Главные ограничения текущего этапа:

- runtime model опережает persistence layer
- workout screen становится слишком умным и тяжелым
- часть будущих SaaS/coach возможностей пока hardcoded в сервисе

Для внешнего senior review проект выглядит как сильная mid-stage product codebase с хорошей продуктной идеей, заметно выше уровня MVP по UX/flow, но еще до этапа архитектурной декомпозиции, которая потребуется для real scale, cloud sync и multi-tenant coach mode.
