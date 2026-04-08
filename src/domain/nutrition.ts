import type { EntityId, MealType } from "@/domain/common";

export type FoodCatalogItem = {
  id: EntityId;
  name: string;
  category: string;
  kcalPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
};

export type FoodLogEntry = {
  id: EntityId;
  foodId: EntityId;
  foodName: string;
  grams: number;
  mealType: MealType;
  consumedAt: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type DailyNutritionSummary = {
  date: string;
  totalKcal: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
};

export type MenuSuggestion = {
  title: string;
  meals: Array<{
    mealType: MealType;
    label: string;
    kcal: number;
  }>;
  totalKcal: number;
};

