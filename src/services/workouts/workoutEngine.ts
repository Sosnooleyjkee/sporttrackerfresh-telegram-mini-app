export { WorkoutHistoryRepository } from "@/repositories/workouts/WorkoutHistoryRepository";
export {
  analyzeWorkoutSessionDraft as analyzeWorkoutDraft,
  buildExerciseKey,
  findNextUnfinishedExerciseKey,
  flattenExerciseKeys,
  getExerciseCompletionProgress,
  markExerciseCompleted,
  reopenCompletedExercise,
  resolveExpandedExerciseKey,
  saveWorkoutSession as buildWorkoutResult,
} from "@/services/workouts/WorkoutSessionOrchestrator";
export {
  calculateRollingMedian,
  getBestSetTrend,
  getDirectionVolumeTrend,
  getLatestDirectionEntries,
  getReadinessTrend,
  getRecentDirectionResults,
  getRecentDirectionVolumes,
  getRecentExerciseEntries,
} from "@/services/workouts/WorkoutAnalyticsQueryService";
export {
  calculateReadinessScore,
  buildCoachingSnapshot,
  buildReadinessProfile,
  COACHING_CONFIG,
  getExerciseSubstitution,
  getRecommendedWorkingWeight,
  getSuggestedTopSet,
} from "@/services/workouts/WorkoutRecommendationService";
export {
  buildDirectionResult,
  buildReward,
  calculateExerciseVolume,
  calculateGroupVolume,
  calculateSetVolume,
  calculateThreshold,
  detectStrengthPath,
  detectVolumePath,
  enrichWorkoutEntries,
  getBestSet,
  updatePersonalRecords,
} from "@/services/workouts/WorkoutProgressionService";

import { createId } from "@/domain/common";
import type { WorkoutSetInput } from "@/domain/workout";

export function createWorkoutSet(weight = 0, reps = 0, type: WorkoutSetInput["type"] = "normal"): WorkoutSetInput {
  return {
    id: createId("set"),
    weight,
    reps,
    type,
    isCompleted: false,
  };
}

export function buildInitialSetEntries(defaultWeight: number, defaultReps: number, defaultSets: number): WorkoutSetInput[] {
  return Array.from({ length: Math.max(defaultSets, 1) }, (_, index) =>
    createWorkoutSet(defaultWeight, defaultReps, index === 0 && defaultWeight > 0 ? "warmup" : "normal"),
  );
}
