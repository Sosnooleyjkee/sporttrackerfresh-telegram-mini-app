import { z } from "zod";

import type { EntityId } from "@/domain/common";

export const trainingDirectionSchema = z.enum([
  "chest",
  "front_delts",
  "side_delts",
  "rear_delts",
  "back",
  "biceps",
  "triceps",
  "legs",
]);

export const workoutSetTypeSchema = z.enum(["normal", "warmup"]);
export const workoutProgressPathSchema = z.enum(["strength", "volume", "weekly_quest", "maintenance", "recovery"]);
export const workoutSessionStatusSchema = z.enum([
  "progress",
  "strength_pr",
  "volume_pr",
  "maintenance",
  "recovery",
  "weekly_quest_complete",
]);
export const readinessModeSchema = z.enum(["pr_day", "progress", "maintenance", "recovery"]);

export type TrainingDirection = z.infer<typeof trainingDirectionSchema>;
export type WorkoutSetType = z.infer<typeof workoutSetTypeSchema>;
export type WorkoutProgressPath = z.infer<typeof workoutProgressPathSchema>;
export type WorkoutSessionStatus = z.infer<typeof workoutSessionStatusSchema>;
export type ReadinessMode = z.infer<typeof readinessModeSchema>;

export type ExerciseTemplate = {
  id: EntityId;
  direction: TrainingDirection;
  name: string;
  order: number;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
};

export const readinessCheckSchema = z.object({
  sleepQuality: z.coerce.number().min(1).max(5),
  energyLevel: z.coerce.number().min(1).max(5),
  muscleSoreness: z.coerce.number().min(1).max(5),
  stress: z.coerce.number().min(1).max(5),
  readinessToPush: z.coerce.number().min(1).max(5),
});

export const workoutSetInputSchema = z.object({
  id: z.string(),
  weight: z.coerce.number().min(0).max(500),
  reps: z.coerce.number().min(0).max(100),
  type: workoutSetTypeSchema,
  isCompleted: z.boolean().default(false),
});

export const workoutExerciseInputSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  setEntries: z.array(workoutSetInputSchema).min(1),
  isCompleted: z.boolean().default(false),
});

export const workoutDirectionBlockSchema = z.object({
  direction: trainingDirectionSchema,
  entries: z.array(workoutExerciseInputSchema).length(5),
});

export const workoutFormSchema = z.object({
  directions: z.array(trainingDirectionSchema).min(1),
  performedAt: z.string().min(1),
  readinessCheck: readinessCheckSchema,
  blocks: z.array(workoutDirectionBlockSchema).min(1),
});

export type ReadinessCheck = z.infer<typeof readinessCheckSchema>;
export type WorkoutSetInput = z.infer<typeof workoutSetInputSchema>;
export type WorkoutExerciseInput = z.infer<typeof workoutExerciseInputSchema>;
export type WorkoutDirectionBlockInput = z.infer<typeof workoutDirectionBlockSchema>;
export type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export type WorkoutSetEntry = WorkoutSetInput & {
  volume: number;
};

export type WorkoutBestSet = {
  weight: number;
  reps: number;
  volume: number;
};

export type ReadinessProfile = {
  score: number;
  mode: ReadinessMode;
  loadMultiplier: number;
  label: string;
};

export type ExerciseRecommendation = {
  exerciseName: string;
  recommendedWeight: number | null;
  substituteTemplateId: string | null;
  substituteName: string | null;
};

export type WorkoutCoachingSnapshot = {
  readiness: ReadinessProfile;
  recommendedSetDelta: number;
  exerciseRecommendations: ExerciseRecommendation[];
};

export type WorkoutExerciseEntry = WorkoutExerciseInput & {
  volume: number;
  bestSet: WorkoutBestSet | null;
  countedSets: number;
  setEntries: WorkoutSetEntry[];
};

export type WorkoutDirectionResult = {
  direction: TrainingDirection;
  groupVolume: number;
  previousGroupVolume: number | null;
  progressThreshold: number;
  rollingQuestBaseline: number | null;
  isQuestCompleted: boolean;
  activePaths: WorkoutProgressPath[];
  entries: WorkoutExerciseEntry[];
};

export type WorkoutSession = {
  id: EntityId;
  directions: TrainingDirection[];
  performedAt: string;
  readinessCheck: ReadinessCheck;
  readinessScore: number;
  suggestedMode: ReadinessMode;
  coachingSnapshot: WorkoutCoachingSnapshot;
  status: WorkoutSessionStatus;
  activePaths: WorkoutProgressPath[];
  blocks: WorkoutDirectionResult[];
};

export type PersonalRecord = {
  id: EntityId;
  direction: TrainingDirection;
  exerciseName: string;
  bestWeight: number;
  reps: number;
  achievedAt: string;
};

export type WorkoutReward = {
  title: string;
  subtitle: string;
};

export type WorkoutSaveResult = {
  saved: true;
  reason: string;
  session: WorkoutSession;
  updatedRecords: PersonalRecord[];
  failedDirections: TrainingDirection[];
  reward: WorkoutReward;
};

export const defaultReadinessCheck: ReadinessCheck = {
  sleepQuality: 3,
  energyLevel: 3,
  muscleSoreness: 3,
  stress: 3,
  readinessToPush: 3,
};
