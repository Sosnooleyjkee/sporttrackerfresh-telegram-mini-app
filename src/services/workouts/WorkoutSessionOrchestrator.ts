import { createId } from "@/domain/common";
import type {
  PersonalRecord,
  ReadinessCheck,
  TrainingDirection,
  WorkoutDirectionBlockInput,
  WorkoutExerciseInput,
  WorkoutSaveResult,
  WorkoutSession,
} from "@/domain/workout";
import { buildDirectionResult, buildReward, resolveSessionStatus } from "@/services/workouts/WorkoutProgressionService";
import { buildCoachingSnapshot } from "@/services/workouts/WorkoutRecommendationService";
import { calculateRollingMedian, getLatestDirectionEntries, getRecentDirectionVolumes } from "@/services/workouts/WorkoutAnalyticsQueryService";
import { WorkoutHistoryRepository } from "@/repositories/workouts/WorkoutHistoryRepository";

export function buildExerciseKey(blockIndex: number, entryIndex: number) {
  return `${blockIndex}:${entryIndex}`;
}

export function flattenExerciseKeys(blocks: WorkoutDirectionBlockInput[]) {
  return blocks.flatMap((block, blockIndex) =>
    block.entries.map((entry, entryIndex) => ({
      key: buildExerciseKey(blockIndex, entryIndex),
      order: blockIndex * 10 + entryIndex,
      isCompleted: entry.isCompleted,
      entry,
    })),
  );
}

export function resolveExpandedExerciseKey(blocks: WorkoutDirectionBlockInput[], currentKey: string | null) {
  const allExerciseKeys = flattenExerciseKeys(blocks).map((item) => item.key);

  if (currentKey && allExerciseKeys.includes(currentKey)) {
    return currentKey;
  }

  const firstOpen = flattenExerciseKeys(blocks).find((item) => !item.isCompleted);
  return firstOpen?.key ?? allExerciseKeys[0] ?? null;
}

export function findNextUnfinishedExerciseKey(
  blocks: WorkoutDirectionBlockInput[],
  blockIndex: number,
  entryIndex: number,
) {
  const currentOrder = blockIndex * 10 + entryIndex;
  return (
    flattenExerciseKeys(blocks).find((candidate) => !candidate.isCompleted && candidate.order > currentOrder)?.key ?? null
  );
}

export function markExerciseCompleted(entry: WorkoutExerciseInput) {
  return { ...entry, isCompleted: true };
}

export function reopenCompletedExercise(entry: WorkoutExerciseInput) {
  return { ...entry, isCompleted: false };
}

export function getExerciseCompletionProgress(blocks: WorkoutDirectionBlockInput[]) {
  const allEntries = blocks.flatMap((block) => block.entries);
  return {
    completedExercises: allEntries.filter((entry) => entry.isCompleted).length,
    totalExercises: allEntries.length,
  };
}

export function analyzeWorkoutSessionDraft(params: {
  directions: TrainingDirection[];
  performedAt: string;
  readinessCheck: ReadinessCheck;
  blocks: WorkoutDirectionBlockInput[];
  history: WorkoutSession[];
  templateNameResolver: (templateId: string) => string | null;
}) {
  const coachingSnapshot = buildCoachingSnapshot({
    blocks: params.blocks,
    readinessCheck: params.readinessCheck,
    history: params.history,
    templateNameResolver: params.templateNameResolver,
  });

  const blockResults = params.blocks.map((block) => {
    const previousVolumes = getRecentDirectionVolumes(params.history, block.direction, 3);
    const previousEntries = getLatestDirectionEntries(params.history, block.direction);
    const previousGroupVolume = previousVolumes[0] ?? null;
    const rollingQuestBaseline = calculateRollingMedian(previousVolumes);

    return buildDirectionResult({
      direction: block.direction,
      entries: block.entries,
      previousGroupVolume,
      rollingQuestBaseline,
      previousEntries,
    });
  });

  const activePaths = Array.from(new Set(blockResults.flatMap((block) => block.activePaths)));
  const status = resolveSessionStatus(activePaths, coachingSnapshot.readiness);

  return {
    blockResults,
    activePaths,
    status,
    coachingSnapshot,
    reward: buildReward(status),
  };
}

export function saveWorkoutSession(params: {
  directions: TrainingDirection[];
  performedAt: string;
  readinessCheck: ReadinessCheck;
  blocks: WorkoutDirectionBlockInput[];
  history: WorkoutSession[];
  existingRecords: PersonalRecord[];
  templateNameResolver: (templateId: string) => string | null;
}): WorkoutSaveResult {
  const analysis = analyzeWorkoutSessionDraft({
    directions: params.directions,
    performedAt: params.performedAt,
    readinessCheck: params.readinessCheck,
    blocks: params.blocks,
    history: params.history,
    templateNameResolver: params.templateNameResolver,
  });

  const session: WorkoutSession = {
    id: createId("workout"),
    directions: params.directions,
    performedAt: params.performedAt,
    readinessCheck: params.readinessCheck,
    readinessScore: analysis.coachingSnapshot.readiness.score,
    suggestedMode: analysis.coachingSnapshot.readiness.mode,
    coachingSnapshot: analysis.coachingSnapshot,
    status: analysis.status,
    activePaths: analysis.activePaths,
    blocks: analysis.blockResults,
  };

  const persisted = WorkoutHistoryRepository.saveSession({
    session,
    history: params.history,
    personalRecords: params.existingRecords,
  });

  return {
    saved: true,
    reason: analysis.reward.subtitle,
    session,
    updatedRecords: persisted.personalRecords,
    failedDirections: [],
    reward: analysis.reward,
  };
}
