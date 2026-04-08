import type { EntityId } from "@/domain/common";

export type Coach = {
  id: EntityId;
  name: string;
  brandName: string;
};

export type Client = {
  id: EntityId;
  coachId: EntityId | null;
  fullName: string;
  goal: string;
};

export type TrainingPlan = {
  id: EntityId;
  clientId: EntityId;
  title: string;
  focus: string;
  isActive: boolean;
};

export type NutritionPlan = {
  id: EntityId;
  clientId: EntityId;
  title: string;
  targetKcal: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
};

export type ClientProgress = {
  id: EntityId;
  clientId: EntityId;
  recordedAt: string;
  weightKg: number;
  chestCm: number | null;
  waistCm: number | null;
  thighCm: number | null;
};

