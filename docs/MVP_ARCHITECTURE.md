# MVP Architecture

## 1. Product modules

The MVP consists of four functional areas:

1. `onboarding`
   - mandatory questionnaire
   - defines user baseline and nutrition target inputs
2. `workouts`
   - direction templates
   - exercise input
   - progression gate
   - PR tracking
   - multi-direction sessions
3. `activity`
   - daily activity summary
   - typed activity categories
   - health-provider ready architecture
4. `nutrition`
   - food catalog
   - KBJU calculation by grams
   - daily totals
   - cut menu suggestion based on questionnaire

Cross-domain:

- `white-label`
- `persistence`
- `theme`
- `navigation`

## 2. Architectural style

The app uses a layered mobile architecture:

- `presentation`
  - React Native screens and reusable components
- `application`
  - store orchestration, selectors, screen-facing actions
- `domain`
  - entities, enums, validation schemas, business rules
- `infrastructure`
  - SQLite schema, repositories, seed data, future Health adapters

Guiding rules:

- business logic must live outside screens
- screens only compose UI and call use-case actions
- SQLite tables mirror domain entities closely
- external health integrations are hidden behind provider adapters
- white-label entities are first-class even if the MVP UI does not expose all of them yet

## 3. Project structure

```text
SportTrackerFresh/
  App.tsx
  app.json
  package.json
  docs/
    MVP_ARCHITECTURE.md
  src/
    app/
      AppBootstrap.tsx
      AppRoot.tsx
    components/
      ui/
      forms/
    constants/
      foodCatalog.ts
      workoutTemplates.ts
    db/
      schema.ts
      migrations.ts
      sqlite.ts
      repositories/
    domain/
      activity.ts
      common.ts
      nutrition.ts
      onboarding.ts
      whitelabel.ts
      workout.ts
    features/
      activity/
      nutrition/
      onboarding/
      workouts/
    navigation/
      MainTabs.tsx
      RootNavigator.tsx
    services/
      health/
      nutrition/
      workouts/
    store/
      useAppStore.ts
    theme/
      appTheme.ts
    utils/
      date.ts
      format.ts
```

## 4. Data models

### Questionnaire

- `UserQuestionnaire`
  - `age`
  - `heightCm`
  - `weightKg`
  - `goal`
  - `level`
  - `dailyStepsTarget`
  - `weeklyTrainingTarget`
  - `isCompleted`

### Workouts

- `TrainingDirection`
  - `chest`
  - `front_delts`
  - `side_delts`
  - `rear_delts`
  - `back`
  - `biceps`
  - `triceps`
  - `legs`
- `ExerciseTemplate`
  - `id`
  - `direction`
  - `name`
  - `order`
- `WorkoutExerciseEntry`
  - `templateId`
  - `name`
  - `weight`
  - `reps`
  - `sets`
  - `volume`
- `WorkoutDirectionResult`
  - `direction`
  - `groupVolume`
  - `previousGroupVolume`
  - `progressThreshold`
  - `isQualified`
  - `entries`
- `WorkoutSession`
  - `id`
  - `directions`
  - `performedAt`
  - `blocks`
- `PersonalRecord`
  - `id`
  - `direction`
  - `exerciseName`
  - `bestWeight`
  - `reps`
  - `achievedAt`

### Activity

- `ActivityType`
  - `walking`
  - `running`
  - `cycling`
  - `swimming`
  - `other`
- `DailyActivity`
  - `id`
  - `date`
  - `steps`
  - `activeMinutes`
  - `walkingMinutes`
  - `runningMinutes`
  - `cyclingMinutes`
  - `swimmingMinutes`
  - `otherMinutes`
- `HealthConnection`
  - `provider`
  - `status`
  - `lastSyncAt`

### Nutrition

- `FoodCatalogItem`
  - `id`
  - `name`
  - `category`
  - `kcalPer100g`
  - `proteinPer100g`
  - `fatPer100g`
  - `carbsPer100g`
- `FoodLogEntry`
  - `id`
  - `foodId`
  - `grams`
  - `mealType`
  - `consumedAt`
  - `kcal`
  - `protein`
  - `fat`
  - `carbs`
- `DailyNutritionSummary`
  - `date`
  - `totalKcal`
  - `totalProtein`
  - `totalFat`
  - `totalCarbs`

### White-label entities

- `Coach`
- `Client`
- `TrainingPlan`
- `NutritionPlan`
- `ClientProgress`

These are included from day one so the app can evolve from a solo tracker into a coach-client product without reworking the domain model.

## 5. Business rules

### Workout volume

- `exerciseVolume = weight * reps * sets`
- `groupVolume = sum(exerciseVolume)`

### Save gate

- if no previous workout exists for a direction, save always
- otherwise the selected direction saves only when:
  - `groupVolume >= previousGroupVolume * 1.03`

For multi-direction sessions:

- the app validates each selected direction separately
- the combined save succeeds only when every selected direction passes its own progression rule

### PR logic

- PR is stored per exercise
- update PR when `weight > bestWeight`
- if weight is equal, later date with higher reps can replace the record

### Nutrition

- food macros are calculated proportionally by grams
- daily totals are derived from all food log entries for the date
- cut menu suggestions use questionnaire data and goal

### Onboarding

- questionnaire completion is required before entering the main app

## 6. DB schema

### Tables

- `questionnaires`
- `exercise_templates`
- `workout_sessions`
- `workout_exercises`
- `personal_records`
- `daily_activity`
- `health_connections`
- `food_catalog`
- `food_log_entries`
- `coaches`
- `clients`
- `training_plans`
- `nutrition_plans`
- `client_progress`

### Relationships

- `workout_sessions 1 -> many workout_exercises`
- `exercise_templates 1 -> many workout_exercises`
- `food_catalog 1 -> many food_log_entries`
- `coaches 1 -> many clients`
- `clients 1 -> many training_plans`
- `clients 1 -> many nutrition_plans`
- `clients 1 -> many client_progress`

## 7. File roadmap

### App shell

- `src/app/AppBootstrap.tsx`
  - initializes DB and seed data
- `src/app/AppRoot.tsx`
  - connects bootstrap to navigation

### Domain

- `src/domain/workout.ts`
  - workout entities and progression rules
- `src/domain/onboarding.ts`
  - questionnaire schema and types
- `src/domain/activity.ts`
  - activity and health-provider types
- `src/domain/nutrition.ts`
  - food, KBJU, meal models
- `src/domain/whitelabel.ts`
  - coach-client entities

### Data and persistence

- `src/constants/workoutTemplates.ts`
  - fixed 5-exercise templates by training direction
- `src/constants/foodCatalog.ts`
  - popular food database seed
- `src/db/schema.ts`
  - create table SQL
- `src/db/sqlite.ts`
  - open/init DB

### Services

- `src/services/workouts/workoutEngine.ts`
  - volume and qualification logic
- `src/services/nutrition/nutritionEngine.ts`
  - KBJU calculators and cut-menu generator
- `src/services/health/healthAdapters.ts`
  - Apple Health / Google Fit abstraction

### State

- `src/store/useAppStore.ts`
  - app-wide state and actions

### Screens

- `src/features/onboarding/OnboardingScreen.tsx`
- `src/features/workouts/WorkoutsScreen.tsx`
- `src/features/activity/ActivityScreen.tsx`
- `src/features/nutrition/NutritionScreen.tsx`

## 8. Delivery order

1. domain contracts
2. templates and seed data
3. business engines
4. SQLite schema
5. global store
6. onboarding screen
7. workouts screen
8. activity screen
9. nutrition screen
10. navigation wiring
