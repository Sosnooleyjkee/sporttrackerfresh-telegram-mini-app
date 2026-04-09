export type EntityId = string;

export type Goal = "cut" | "maintain" | "muscle_gain";
export type Gender = "male" | "female";
export type Level = "beginner" | "intermediate" | "advanced";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
