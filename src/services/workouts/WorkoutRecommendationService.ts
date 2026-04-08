import type {
  ExerciseRecommendation,
  ReadinessCheck,
  ReadinessProfile,
  WorkoutCoachingSnapshot,
  WorkoutDirectionBlockInput,
  WorkoutExerciseInput,
  WorkoutSession,
} from "@/domain/workout";
import { getRecentExerciseEntries } from "@/services/workouts/WorkoutAnalyticsQueryService";

export const COACHING_CONFIG = {
  readinessBands: {
    prDay: 85,
    progress: 70,
    maintenance: 50,
  },
  loadMultipliers: {
    pr_day: 1.02,
    progress: 0.99,
    maintenance: 0.94,
    recovery: 0.9,
  },
  setDeltas: {
    pr_day: 1,
    progress: 0,
    maintenance: -1,
    recovery: -1,
  },
} as const;

const LOW_READINESS_SUBSTITUTIONS: Record<string, string> = {
  chest_1: "chest_6",
  chest_2: "chest_6",
  back_2: "back_3",
  back_10: "back_3",
  legs_1: "legs_2",
  legs_7: "legs_2",
  front_delts_6: "front_delts_1",
  front_delts_7: "front_delts_1",
};

export function calculateReadinessScore(readiness: ReadinessCheck) {
  const sorenessNormalized = 6 - readiness.muscleSoreness;
  const stressNormalized = 6 - readiness.stress;
  const weighted =
    readiness.sleepQuality * 0.24 +
    readiness.energyLevel * 0.24 +
    sorenessNormalized * 0.18 +
    stressNormalized * 0.14 +
    readiness.readinessToPush * 0.2;

  return Math.round((weighted / 5) * 100);
}

export function buildReadinessProfile(readiness: ReadinessCheck): ReadinessProfile {
  const score = calculateReadinessScore(readiness);

  if (score >= COACHING_CONFIG.readinessBands.prDay) {
    return { score, mode: "pr_day", loadMultiplier: COACHING_CONFIG.loadMultipliers.pr_day, label: "День рекорда" };
  }

  if (score >= COACHING_CONFIG.readinessBands.progress) {
    return { score, mode: "progress", loadMultiplier: COACHING_CONFIG.loadMultipliers.progress, label: "День прогресса" };
  }

  if (score >= COACHING_CONFIG.readinessBands.maintenance) {
    return {
      score,
      mode: "maintenance",
      loadMultiplier: COACHING_CONFIG.loadMultipliers.maintenance,
      label: "День поддержания",
    };
  }

  return { score, mode: "recovery", loadMultiplier: COACHING_CONFIG.loadMultipliers.recovery, label: "День восстановления" };
}

export function getSuggestedTopSet(entryName: string, history: WorkoutSession[]) {
  const bestSets = getRecentExerciseEntries(history, entryName, 3).map((entry) => entry.bestSet).filter(Boolean);
  if (bestSets.length === 0) {
    return null;
  }

  return bestSets.reduce(
    (sum, bestSet) => ({
      weight: sum.weight + (bestSet?.weight ?? 0),
      reps: sum.reps + (bestSet?.reps ?? 0),
    }),
    { weight: 0, reps: 0 },
  );
}

export function getRecommendedWorkingWeight(entry: WorkoutExerciseInput, history: WorkoutSession[], multiplier: number) {
  const suggestedTopSet = getSuggestedTopSet(entry.name, history);
  if (!suggestedTopSet) {
    const firstNormalSet = entry.setEntries.find((setEntry) => setEntry.type === "normal");
    return firstNormalSet ? Math.round(firstNormalSet.weight * multiplier * 2) / 2 : null;
  }

  const divisor = Math.max(Math.min(3, getRecentExerciseEntries(history, entry.name, 3).length), 1);
  const avgWeight = suggestedTopSet.weight / divisor;
  return Math.max(0, Math.round(avgWeight * multiplier * 2) / 2);
}

export function getExerciseSubstitution(templateId: string, readiness: ReadinessProfile) {
  if (readiness.mode !== "maintenance" && readiness.mode !== "recovery") {
    return null;
  }

  return LOW_READINESS_SUBSTITUTIONS[templateId] ?? null;
}

export function buildCoachingSnapshot(params: {
  blocks: WorkoutDirectionBlockInput[];
  readinessCheck: ReadinessCheck;
  history: WorkoutSession[];
  templateNameResolver: (templateId: string) => string | null;
}): WorkoutCoachingSnapshot {
  const readiness = buildReadinessProfile(params.readinessCheck);
  const exerciseRecommendations: ExerciseRecommendation[] = params.blocks.flatMap((block) =>
    block.entries.map((entry) => {
      const substituteTemplateId = getExerciseSubstitution(entry.templateId, readiness);
      return {
        exerciseName: entry.name,
        recommendedWeight: getRecommendedWorkingWeight(entry, params.history, readiness.loadMultiplier),
        substituteTemplateId,
        substituteName: substituteTemplateId ? params.templateNameResolver(substituteTemplateId) : null,
      };
    }),
  );

  return {
    readiness,
    recommendedSetDelta: COACHING_CONFIG.setDeltas[readiness.mode],
    exerciseRecommendations,
  };
}
