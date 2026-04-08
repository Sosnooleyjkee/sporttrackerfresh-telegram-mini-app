import type {
  PersonalRecord,
  TrainingDirection,
  WorkoutDirectionResult,
  WorkoutExerciseEntry,
  WorkoutSession,
  WorkoutSetInput,
} from "@/domain/workout";

type MuscleAnalyticsKey = "chest" | "back" | "shoulders" | "arms" | "legs";

const groupedDirections: Record<MuscleAnalyticsKey, TrainingDirection[]> = {
  chest: ["chest"],
  back: ["back"],
  shoulders: ["front_delts", "side_delts", "rear_delts"],
  arms: ["biceps", "triceps"],
  legs: ["legs"],
};

export function calculateRollingMedian(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }

  return sorted[mid];
}

export function getRecentDirectionResults(
  history: WorkoutSession[],
  direction: TrainingDirection,
  limit = 3,
): WorkoutDirectionResult[] {
  return history
    .flatMap((session) => session.blocks)
    .filter((block) => block.direction === direction)
    .slice(0, limit);
}

export function getRecentDirectionVolumes(history: WorkoutSession[], direction: TrainingDirection, limit = 3) {
  return getRecentDirectionResults(history, direction, limit).map((block) => block.groupVolume);
}

export function getLatestDirectionEntries(history: WorkoutSession[], direction: TrainingDirection) {
  return getRecentDirectionResults(history, direction, 1)[0]?.entries ?? [];
}

export function getRecentExerciseEntries(history: WorkoutSession[], exerciseName: string, limit = 3): WorkoutExerciseEntry[] {
  return history
    .flatMap((session) => session.blocks.flatMap((block) => block.entries))
    .filter((entry) => entry.name === exerciseName)
    .slice(0, limit);
}

export function getBestSetTrend(history: WorkoutSession[], exerciseName: string, limit = 5) {
  return getRecentExerciseEntries(history, exerciseName, limit)
    .map((entry) => entry.bestSet)
    .filter(Boolean);
}

export function getReadinessTrend(history: WorkoutSession[], limit = 14) {
  return history.slice(0, limit).map((session) => ({
    performedAt: session.performedAt,
    readinessScore: session.readinessScore,
    suggestedMode: session.suggestedMode,
  }));
}

export function getDirectionVolumeTrend(history: WorkoutSession[], direction: TrainingDirection, limit = 8) {
  return getRecentDirectionResults(history, direction, limit).map((block) => ({
    performedAt: history.find((session) => session.blocks.some((item) => item === block))?.performedAt ?? "",
    groupVolume: block.groupVolume,
    activePaths: block.activePaths,
  }));
}

export function countHardSets(setEntries: WorkoutSetInput[]) {
  return setEntries.filter((setEntry) => setEntry.type === "normal" && setEntry.reps > 0).length;
}

export function getRecentSessionSummaries(history: WorkoutSession[], limit = 8) {
  return history.slice(0, limit).map((session) => ({
    id: session.id,
    performedAt: session.performedAt,
    directions: session.directions,
    status: session.status,
    totalVolume: session.blocks.reduce((sum, block) => sum + block.groupVolume, 0),
    activePaths: session.activePaths,
    readinessScore: session.readinessScore,
  }));
}

export function getRecentlyBrokenPRs(records: PersonalRecord[], limit = 6) {
  return [...records]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, limit);
}

export function getTopLiftHighlights(records: PersonalRecord[], limit = 5) {
  return [...records]
    .sort((a, b) => {
      if (b.bestWeight !== a.bestWeight) {
        return b.bestWeight - a.bestWeight;
      }

      return b.reps - a.reps;
    })
    .slice(0, limit);
}

export function getStrengthChangeSummary(records: PersonalRecord[], history: WorkoutSession[], days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return records
    .map((record) => {
      const relevantEntries = history
        .filter((session) => new Date(session.performedAt).getTime() >= cutoff)
        .flatMap((session) => session.blocks.flatMap((block) => block.entries))
        .filter((entry) => entry.name === record.exerciseName && entry.bestSet);

      const earliest = relevantEntries[relevantEntries.length - 1]?.bestSet;
      const latest = relevantEntries[0]?.bestSet;

      return {
        exerciseName: record.exerciseName,
        direction: record.direction,
        currentWeight: latest?.weight ?? record.bestWeight,
        currentReps: latest?.reps ?? record.reps,
        deltaWeight: latest && earliest ? latest.weight - earliest.weight : 0,
        deltaReps: latest && earliest ? latest.reps - earliest.reps : 0,
      };
    })
    .filter((item) => item.currentWeight > 0)
    .sort((a, b) => Math.abs(b.deltaWeight) - Math.abs(a.deltaWeight))
    .slice(0, 6);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getQuestAndStreakSummary(history: WorkoutSession[], weeklyTrainingTarget: number) {
  const byWeek = new Map<string, WorkoutSession[]>();

  history.forEach((session) => {
    const weekStart = startOfWeek(new Date(session.performedAt)).toISOString().slice(0, 10);
    byWeek.set(weekStart, [...(byWeek.get(weekStart) ?? []), session]);
  });

  const weeks = [...byWeek.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const completedWeeks = weeks.filter(([, sessions]) =>
    sessions.some((session) => session.activePaths.includes("weekly_quest")),
  ).length;

  let weeklyQuestStreak = 0;
  for (const [, sessions] of weeks) {
    if (sessions.some((session) => session.activePaths.includes("weekly_quest"))) {
      weeklyQuestStreak += 1;
      continue;
    }
    break;
  }

  const last28DaysCutoff = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const last28Sessions = history.filter((session) => new Date(session.performedAt).getTime() >= last28DaysCutoff);
  const expectedSessions = Math.max(weeklyTrainingTarget, 0) * 4;
  const adherence = expectedSessions > 0 ? Math.min(100, Math.round((last28Sessions.length / expectedSessions) * 100)) : 0;
  const missedSessions = Math.max(expectedSessions - last28Sessions.length, 0);

  const lowReadinessSessions = history.filter((session) => session.readinessScore < 50);
  const recoveryCompliant = lowReadinessSessions.filter(
    (session) => session.status === "recovery" || session.status === "maintenance",
  ).length;

  return {
    weeklyQuestStreak,
    completedWeeks,
    adherence,
    recoveryCompliance:
      lowReadinessSessions.length > 0 ? Math.round((recoveryCompliant / lowReadinessSessions.length) * 100) : 100,
    missedSessions,
  };
}

export function getReadinessAnalytics(history: WorkoutSession[], limit = 14) {
  const points = history.slice(0, limit).map((session) => ({
    performedAt: session.performedAt,
    readinessScore: session.readinessScore,
    sleepQuality: session.readinessCheck.sleepQuality,
    status: session.status,
    suggestedMode: session.suggestedMode,
  }));

  const bestPrDays = points.filter((point) => point.status === "strength_pr" || point.status === "volume_pr").length;
  const recoveryDays = points.filter((point) => point.status === "recovery").length;
  const fatigueDays = points.filter((point) => point.readinessScore < 50).length;
  const averageReadiness =
    points.length > 0 ? Math.round(points.reduce((sum, point) => sum + point.readinessScore, 0) / points.length) : 0;
  const averageSleep = points.length > 0 ? points.reduce((sum, point) => sum + point.sleepQuality, 0) / points.length : 0;
  const sleepCorrelationHint =
    averageSleep >= 4 ? "Сильная база сна поддерживает стабильную готовность." : averageSleep >= 3 ? "Сон влияет на рабочие дни умеренно." : "Сон выглядит главным ограничителем готовности.";

  return {
    points: points.reverse(),
    bestPrDays,
    recoveryDays,
    fatigueDays,
    averageReadiness,
    sleepCorrelationHint,
  };
}

export function getMuscleAnalytics(history: WorkoutSession[]) {
  return (Object.keys(groupedDirections) as MuscleAnalyticsKey[]).map((key) => {
    const directions = groupedDirections[key];
    const relevantBlocks = history.flatMap((session) =>
      session.blocks
        .filter((block) => directions.includes(block.direction))
        .map((block) => ({
          performedAt: session.performedAt,
          groupVolume: block.groupVolume,
          activePaths: block.activePaths,
        })),
    );

    const recentVolumes = relevantBlocks.slice(0, 4).map((block) => block.groupVolume);
    const last30DaysCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const frequency = relevantBlocks.filter((block) => new Date(block.performedAt).getTime() >= last30DaysCutoff).length;
    const lastProgressBlock = relevantBlocks.find((block) =>
      block.activePaths.some((path) => path === "strength" || path === "volume" || path === "weekly_quest"),
    );
    const stagnationDays = lastProgressBlock
      ? Math.max(0, Math.round((Date.now() - new Date(lastProgressBlock.performedAt).getTime()) / (24 * 60 * 60 * 1000)))
      : null;
    const prDensity =
      relevantBlocks.length > 0
        ? Math.round(
            (relevantBlocks.filter((block) => block.activePaths.includes("strength") || block.activePaths.includes("volume")).length /
              relevantBlocks.length) *
              100,
          )
        : 0;

    return {
      key,
      directions,
      recentVolumes,
      frequency,
      stagnationDays,
      prDensity,
      latestVolume: relevantBlocks[0]?.groupVolume ?? 0,
    };
  });
}
