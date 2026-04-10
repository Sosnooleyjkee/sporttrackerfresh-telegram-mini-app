import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";

import { foodCatalogSeed } from "@/constants/foodCatalog";
import { getDefaultTemplatesForDirection, getExerciseTemplateById } from "@/constants/workoutTemplates";
import { createId } from "@/domain/common";
import type { ActivityType, DailyActivity, HealthConnection } from "@/domain/activity";
import type { FoodLogEntry } from "@/domain/nutrition";
import { defaultQuestionnaire, type UserQuestionnaire } from "@/domain/onboarding";
import { defaultTelegramSession, type TelegramSession } from "@/domain/telegram";
import type { Coach, Client, ClientProgress, NutritionPlan, TrainingPlan } from "@/domain/whitelabel";
import {
  defaultReadinessCheck,
  type ReadinessCheck,
  type PersonalRecord,
  type TrainingDirection,
  type WorkoutDirectionBlockInput,
  type WorkoutExerciseInput,
  type WorkoutSaveResult,
  type WorkoutSession,
} from "@/domain/workout";
import { calculateMacrosForGrams, generateCutMenu, sumNutrition } from "@/services/nutrition/nutritionEngine";
import { buildInitialSetEntries, buildWorkoutResult } from "@/services/workouts/workoutEngine";
import { nowIsoString, todayIsoDate } from "@/utils/date";

type AppState = {
  isBootstrapped: boolean;
  questionnaire: UserQuestionnaire;
  selectedDirections: TrainingDirection[];
  readinessCheck: ReadinessCheck;
  workoutHistory: WorkoutSession[];
  personalRecords: PersonalRecord[];
  dailyActivities: DailyActivity[];
  foodLogEntries: FoodLogEntry[];
  healthConnections: HealthConnection[];
  coach: Coach;
  client: Client;
  trainingPlan: TrainingPlan;
  nutritionPlan: NutritionPlan;
  clientProgress: ClientProgress[];
  telegramSession: TelegramSession;
  finishBootstrap: () => void;
  setTelegramSession: (payload: TelegramSession) => void;
  completeQuestionnaire: (payload: UserQuestionnaire) => void;
  setReadinessCheck: (payload: ReadinessCheck) => void;
  toggleDirection: (direction: TrainingDirection) => void;
  setDirections: (directions: TrainingDirection[]) => void;
  getTemplateBlocksForDirections: (directions: TrainingDirection[]) => WorkoutDirectionBlockInput[];
  saveWorkout: (payload: {
    directions: TrainingDirection[];
    performedAt: string;
    readinessCheck: ReadinessCheck;
    blocks: WorkoutDirectionBlockInput[];
  }) => WorkoutSaveResult;
  upsertDailyActivity: (payload: DailyActivity) => void;
  logActivityMinutes: (payload: { type: ActivityType; minutes: number; steps?: number }) => void;
  addFoodLogEntry: (payload: { foodId: string; grams: number; mealType: FoodLogEntry["mealType"] }) => void;
};

type PersistedAppState = Pick<
  AppState,
  | "questionnaire"
  | "selectedDirections"
  | "readinessCheck"
  | "workoutHistory"
  | "personalRecords"
  | "dailyActivities"
  | "foodLogEntries"
  | "healthConnections"
  | "coach"
  | "client"
  | "trainingPlan"
  | "nutritionPlan"
  | "clientProgress"
>;

export const APP_STORE_STORAGE_KEY = "sporttrackerfresh-app-store-v2";

type RawStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const noopStorage: RawStorageLike = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function resolveSafeStorage(): RawStorageLike {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
      const storage = globalThis.localStorage;
      const probeKey = "__sporttrackerfresh_probe__";
      storage.setItem(probeKey, "1");
      storage.removeItem(probeKey);
      return storage;
    }
  } catch {
    return noopStorage;
  }

  return noopStorage;
}

const appStoreStorage: PersistStorage<PersistedAppState> = {
  getItem: (name) => {
    try {
      const raw = resolveSafeStorage().getItem(name);
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as StorageValue<PersistedAppState>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      resolveSafeStorage().setItem(name, JSON.stringify(value));
    } catch {
      // ignore storage failures in restrictive webviews
    }
  },
  removeItem: (name) => {
    try {
      resolveSafeStorage().removeItem(name);
    } catch {
      // ignore storage failures in restrictive webviews
    }
  },
};

const initialActivities: DailyActivity[] = [
  {
    id: "activity_today",
    date: todayIsoDate(),
    steps: 8420,
    activeMinutes: 54,
    walkingMinutes: 28,
    runningMinutes: 12,
    cyclingMinutes: 0,
    swimmingMinutes: 0,
    strengthMinutes: 14,
    hiitMinutes: 0,
    mobilityMinutes: 0,
    yogaMinutes: 0,
    stairsMinutes: 0,
    boxingMinutes: 0,
    teamSportMinutes: 0,
    hikingMinutes: 0,
    ellipticalMinutes: 0,
    otherMinutes: 14,
  },
];

const initialHealthConnections: HealthConnection[] = [
  { provider: "apple_health", status: "planned", lastSyncAt: null },
  { provider: "google_fit", status: "planned", lastSyncAt: null },
];

const defaultCoach: Coach = {
  id: "coach_default",
  name: "Default Coach",
  brandName: "SportTracker Studio",
};

const defaultClient: Client = {
  id: "client_default",
  coachId: "coach_default",
  fullName: "Primary User",
  goal: "cut",
};

const defaultTrainingPlan: TrainingPlan = {
  id: "training_plan_default",
  clientId: "client_default",
  title: "MVP Strength Split",
  focus: "Hypertrophy + progression gate",
  isActive: true,
};

const defaultNutritionPlan: NutritionPlan = {
  id: "nutrition_plan_default",
  clientId: "client_default",
  title: "Cut Plan",
  targetKcal: 2200,
  targetProtein: 180,
  targetFat: 70,
  targetCarbs: 190,
};

function sanitizePersistedState(value: unknown): PersistedAppState {
  const state = value && typeof value === "object" ? (value as Partial<PersistedAppState>) : {};

  return {
    questionnaire: {
      ...defaultQuestionnaire,
      ...(state.questionnaire ?? {}),
      gender: state.questionnaire?.gender === "female" ? "female" : "male",
      goal: state.questionnaire?.goal ?? defaultQuestionnaire.goal,
      isCompleted: Boolean(state.questionnaire?.isCompleted),
    },
    selectedDirections:
      Array.isArray(state.selectedDirections) && state.selectedDirections.length > 0
        ? state.selectedDirections
        : ["chest"],
    readinessCheck: {
      ...defaultReadinessCheck,
      ...(state.readinessCheck ?? {}),
    },
    workoutHistory: Array.isArray(state.workoutHistory) ? state.workoutHistory : [],
    personalRecords: Array.isArray(state.personalRecords) ? state.personalRecords : [],
    dailyActivities: Array.isArray(state.dailyActivities) && state.dailyActivities.length > 0 ? state.dailyActivities : initialActivities,
    foodLogEntries: Array.isArray(state.foodLogEntries) ? state.foodLogEntries : [],
    healthConnections:
      Array.isArray(state.healthConnections) && state.healthConnections.length > 0
        ? state.healthConnections
        : initialHealthConnections,
    coach: {
      ...defaultCoach,
      ...(state.coach ?? {}),
    },
    client: {
      ...defaultClient,
      ...(state.client ?? {}),
    },
    trainingPlan: {
      ...defaultTrainingPlan,
      ...(state.trainingPlan ?? {}),
    },
    nutritionPlan: {
      ...defaultNutritionPlan,
      ...(state.nutritionPlan ?? {}),
    },
    clientProgress: Array.isArray(state.clientProgress) ? state.clientProgress : [],
  };
}

function buildTemplateBlock(direction: TrainingDirection): WorkoutDirectionBlockInput {
  return {
    direction,
    entries: getDefaultTemplatesForDirection(direction).map(
      (item): WorkoutExerciseInput => ({
        templateId: item.id,
        name: item.name,
        setEntries: buildInitialSetEntries(item.defaultWeight, item.defaultReps, item.defaultSets),
        isCompleted: false,
      }),
    ),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  isBootstrapped: false,
  questionnaire: defaultQuestionnaire,
  selectedDirections: ["chest"],
  readinessCheck: {
    sleepQuality: 3,
    energyLevel: 3,
    muscleSoreness: 3,
    stress: 3,
    readinessToPush: 3,
  },
  workoutHistory: [],
  personalRecords: [],
  dailyActivities: initialActivities,
  foodLogEntries: [],
  healthConnections: initialHealthConnections,
  coach: defaultCoach,
  client: defaultClient,
  trainingPlan: defaultTrainingPlan,
  nutritionPlan: defaultNutritionPlan,
  clientProgress: [],
  telegramSession: defaultTelegramSession,
  finishBootstrap: () => set({ isBootstrapped: true }),
  setTelegramSession: (payload) => set({ telegramSession: payload }),
  completeQuestionnaire: (payload) => {
    const normalized = { ...payload, isCompleted: true };
    const cutMenu = generateCutMenu(normalized);

    set((state) => ({
      questionnaire: normalized,
      nutritionPlan: {
        ...state.nutritionPlan,
        targetKcal: cutMenu.totalKcal,
        targetProtein: Math.round(normalized.weightKg * 2.1),
        targetFat: Math.round(normalized.weightKg * 0.8),
        targetCarbs: Math.round(
          (cutMenu.totalKcal -
            Math.round(normalized.weightKg * 2.1) * 4 -
            Math.round(normalized.weightKg * 0.8) * 9) /
            4,
        ),
      },
      client: {
        ...state.client,
        goal: normalized.goal,
      },
    }));
  },
  setReadinessCheck: (payload) => set({ readinessCheck: payload }),
  toggleDirection: (direction) =>
    set((state) => {
      const exists = state.selectedDirections.includes(direction);
      const selectedDirections = exists
        ? state.selectedDirections.filter((item) => item !== direction)
        : [...state.selectedDirections, direction];

      return {
        selectedDirections: selectedDirections.length > 0 ? selectedDirections : state.selectedDirections,
      };
    }),
  setDirections: (directions) => set({ selectedDirections: directions }),
  getTemplateBlocksForDirections: (directions) => directions.map((direction) => buildTemplateBlock(direction)),
  saveWorkout: ({ directions, performedAt, readinessCheck, blocks }) => {
    const result = buildWorkoutResult({
      directions,
      performedAt,
      readinessCheck,
      blocks,
      history: get().workoutHistory,
      existingRecords: get().personalRecords,
      templateNameResolver: (templateId) => getExerciseTemplateById(templateId)?.name ?? null,
    });

    set((state) => ({
      workoutHistory: [result.session, ...state.workoutHistory],
      personalRecords: result.updatedRecords,
      readinessCheck,
      clientProgress: [
        {
          id: createId("progress"),
          clientId: state.client.id,
          recordedAt: performedAt,
          weightKg: state.questionnaire.weightKg,
          chestCm: null,
          waistCm: null,
          thighCm: null,
        },
        ...state.clientProgress,
      ],
    }));

    return result;
  },
  upsertDailyActivity: (payload) =>
    set((state) => {
      const rest = state.dailyActivities.filter((item) => item.date !== payload.date);
      return { dailyActivities: [payload, ...rest] };
    }),
  logActivityMinutes: ({ type, minutes, steps = 0 }) =>
    set((state) => {
      const current = state.dailyActivities.find((item) => item.date === todayIsoDate()) ?? state.dailyActivities[0];
      if (!current) {
        return state;
      }

      const next: DailyActivity = {
        ...current,
        steps: current.steps + steps,
        activeMinutes: current.activeMinutes + minutes,
      };

      switch (type) {
        case "walking":
          next.walkingMinutes += minutes;
          break;
        case "running":
          next.runningMinutes += minutes;
          break;
        case "cycling":
          next.cyclingMinutes += minutes;
          break;
        case "swimming":
          next.swimmingMinutes += minutes;
          break;
        case "strength":
          next.strengthMinutes += minutes;
          break;
        case "hiit":
          next.hiitMinutes += minutes;
          break;
        case "mobility":
          next.mobilityMinutes += minutes;
          break;
        case "yoga":
          next.yogaMinutes += minutes;
          break;
        case "stairs":
          next.stairsMinutes += minutes;
          break;
        case "boxing":
          next.boxingMinutes += minutes;
          break;
        case "team_sport":
          next.teamSportMinutes += minutes;
          break;
        case "hiking":
          next.hikingMinutes += minutes;
          break;
        case "elliptical":
          next.ellipticalMinutes += minutes;
          break;
        case "other":
          next.otherMinutes += minutes;
          break;
      }

      const rest = state.dailyActivities.filter((item) => item.date !== current.date);
      return {
        dailyActivities: [next, ...rest],
      };
    }),
  addFoodLogEntry: ({ foodId, grams, mealType }) =>
    set((state) => {
      const food = foodCatalogSeed.find((item) => item.id === foodId);
      if (!food) {
        return state;
      }

      const macros = calculateMacrosForGrams(food, grams);
      const entry: FoodLogEntry = {
        id: createId("foodlog"),
        foodId,
        foodName: food.name,
        grams,
        mealType,
        consumedAt: nowIsoString(),
        ...macros,
      };

      return {
        foodLogEntries: [entry, ...state.foodLogEntries],
      };
    }),
    }),
    {
      name: APP_STORE_STORAGE_KEY,
      version: 2,
      storage: appStoreStorage,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizePersistedState(persistedState),
      }),
      partialize: (state): PersistedAppState => ({
        questionnaire: state.questionnaire,
        selectedDirections: state.selectedDirections,
        readinessCheck: state.readinessCheck,
        workoutHistory: state.workoutHistory,
        personalRecords: state.personalRecords,
        dailyActivities: state.dailyActivities,
        foodLogEntries: state.foodLogEntries,
        healthConnections: state.healthConnections,
        coach: state.coach,
        client: state.client,
        trainingPlan: state.trainingPlan,
        nutritionPlan: state.nutritionPlan,
        clientProgress: state.clientProgress,
      }),
    },
  ),
);

export function useTodayNutritionSummary() {
  const entries = useAppStore((state) => state.foodLogEntries);
  return sumNutrition(entries, todayIsoDate());
}
