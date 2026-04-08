import type { FoodCatalogItem, FoodLogEntry, MenuSuggestion } from "@/domain/nutrition";
import type { UserQuestionnaire } from "@/domain/onboarding";

export function calculateMacrosForGrams(food: FoodCatalogItem, grams: number) {
  const factor = grams / 100;

  return {
    kcal: Number((food.kcalPer100g * factor).toFixed(1)),
    protein: Number((food.proteinPer100g * factor).toFixed(1)),
    fat: Number((food.fatPer100g * factor).toFixed(1)),
    carbs: Number((food.carbsPer100g * factor).toFixed(1)),
  };
}

export function sumNutrition(entries: FoodLogEntry[], date: string) {
  const dailyEntries = entries.filter((entry) => entry.consumedAt.startsWith(date));

  return dailyEntries.reduce(
    (acc, entry) => ({
      date,
      totalKcal: Number((acc.totalKcal + entry.kcal).toFixed(1)),
      totalProtein: Number((acc.totalProtein + entry.protein).toFixed(1)),
      totalFat: Number((acc.totalFat + entry.fat).toFixed(1)),
      totalCarbs: Number((acc.totalCarbs + entry.carbs).toFixed(1)),
    }),
    {
      date,
      totalKcal: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
    },
  );
}

export function estimateCutCalories(questionnaire: UserQuestionnaire) {
  const base = questionnaire.weightKg * 24;
  const activityBonus = questionnaire.weeklyTrainingTarget * 80 + questionnaire.dailyStepsTarget / 250;
  return Math.max(1400, Math.round(base + activityBonus - 350));
}

export function generateCutMenu(questionnaire: UserQuestionnaire): MenuSuggestion {
  const totalKcal = estimateCutCalories(questionnaire);
  const breakfast = Math.round(totalKcal * 0.25);
  const lunch = Math.round(totalKcal * 0.35);
  const dinner = Math.round(totalKcal * 0.25);
  const snack = totalKcal - breakfast - lunch - dinner;

  return {
    title: "Меню на сушку",
    totalKcal,
    meals: [
      { mealType: "breakfast", label: "Овсянка, яйца, йогурт", kcal: breakfast },
      { mealType: "lunch", label: "Курица, рис, овощи", kcal: lunch },
      { mealType: "dinner", label: "Лосось или творог, гречка, салат", kcal: dinner },
      { mealType: "snack", label: "Банан, миндаль, йогурт", kcal: snack },
    ],
  };
}

