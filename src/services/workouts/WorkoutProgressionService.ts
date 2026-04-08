import { createId } from "@/domain/common";
import type {
  PersonalRecord,
  ReadinessProfile,
  TrainingDirection,
  WorkoutDirectionBlockInput,
  WorkoutDirectionResult,
  WorkoutExerciseEntry,
  WorkoutExerciseInput,
  WorkoutProgressPath,
  WorkoutReward,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutSetEntry,
  WorkoutSetInput,
} from "@/domain/workout";
import {
  calculateRollingMedian,
  countHardSets,
  getLatestDirectionEntries,
  getRecentDirectionVolumes,
} from "@/services/workouts/WorkoutAnalyticsQueryService";

export function calculateSetVolume(setEntry: WorkoutSetInput | WorkoutSetEntry, includeWarmup = false) {
  if (!includeWarmup && setEntry.type === "warmup") {
    return 0;
  }

  return setEntry.weight * setEntry.reps;
}

export function calculateExerciseVolume(entry: WorkoutExerciseInput) {
  return entry.setEntries.reduce((sum, setEntry) => sum + calculateSetVolume(setEntry), 0);
}

export function calculateGroupVolume(entries: WorkoutExerciseInput[]) {
  return entries.reduce((sum, entry) => sum + calculateExerciseVolume(entry), 0);
}

export function calculateThreshold(previousGroupVolume: number | null) {
  if (previousGroupVolume == null) {
    return 0;
  }

  return Number((previousGroupVolume * 1.03).toFixed(2));
}

export function getBestSet(entry: WorkoutExerciseInput) {
  const countedSets = entry.setEntries.filter((setEntry) => setEntry.type === "normal");
  if (countedSets.length === 0) {
    return null;
  }

  return countedSets.reduce((best, current) => {
    const currentVolume = calculateSetVolume(current, true);
    if (!best) {
      return { weight: current.weight, reps: current.reps, volume: currentVolume };
    }

    if (current.weight > best.weight) {
      return { weight: current.weight, reps: current.reps, volume: currentVolume };
    }

    if (current.weight === best.weight && current.reps > best.reps) {
      return { weight: current.weight, reps: current.reps, volume: currentVolume };
    }

    if (current.weight === best.weight && current.reps === best.reps && currentVolume > best.volume) {
      return { weight: current.weight, reps: current.reps, volume: currentVolume };
    }

    return best;
  }, null as WorkoutExerciseEntry["bestSet"]);
}

export function enrichWorkoutEntries(entries: WorkoutExerciseInput[]): WorkoutExerciseEntry[] {
  return entries.map((entry) => {
    const setEntries: WorkoutSetEntry[] = entry.setEntries.map((setEntry) => ({
      ...setEntry,
      volume: calculateSetVolume(setEntry),
    }));

    return {
      ...entry,
      setEntries,
      countedSets: countHardSets(setEntries),
      volume: setEntries.reduce((sum, setEntry) => sum + setEntry.volume, 0),
      bestSet: getBestSet(entry),
    };
  });
}

export function detectStrengthPath(currentEntry: WorkoutExerciseInput, previousEntry?: WorkoutExerciseEntry) {
  const currentBestSet = getBestSet(currentEntry);
  if (!currentBestSet || !previousEntry?.bestSet) {
    return false;
  }

  if (currentBestSet.weight > previousEntry.bestSet.weight) {
    return true;
  }

  if (currentBestSet.weight === previousEntry.bestSet.weight && currentBestSet.reps > previousEntry.bestSet.reps) {
    return true;
  }

  return currentBestSet.volume > previousEntry.bestSet.volume;
}

export function detectVolumePath(currentEntry: WorkoutExerciseInput, previousEntry?: WorkoutExerciseEntry) {
  const currentVolume = calculateExerciseVolume(currentEntry);
  const currentHardSets = countHardSets(currentEntry.setEntries);

  if (!previousEntry) {
    return currentHardSets >= 3;
  }

  return currentVolume > previousEntry.volume || currentHardSets > previousEntry.countedSets;
}

export function buildDirectionResult(params: {
  direction: TrainingDirection;
  entries: WorkoutExerciseInput[];
  previousGroupVolume: number | null;
  rollingQuestBaseline: number | null;
  previousEntries: WorkoutExerciseEntry[];
}): WorkoutDirectionResult {
  const enrichedEntries = enrichWorkoutEntries(params.entries);
  const groupVolume = enrichedEntries.reduce((sum, entry) => sum + entry.volume, 0);
  const threshold = calculateThreshold(params.previousGroupVolume);
  const strengthTriggered = enrichedEntries.some((entry) =>
    detectStrengthPath(entry, params.previousEntries.find((previousEntry) => previousEntry.name === entry.name)),
  );
  const volumeTriggered = enrichedEntries.some((entry) =>
    detectVolumePath(entry, params.previousEntries.find((previousEntry) => previousEntry.name === entry.name)),
  );
  const questTarget = params.rollingQuestBaseline == null ? null : Number((params.rollingQuestBaseline * 1.03).toFixed(2));
  const isQuestCompleted = questTarget == null ? false : groupVolume >= questTarget;

  const activePaths: WorkoutProgressPath[] = [];
  if (strengthTriggered) {
    activePaths.push("strength");
  }
  if (volumeTriggered) {
    activePaths.push("volume");
  }
  if (isQuestCompleted) {
    activePaths.push("weekly_quest");
  }
  if (activePaths.length === 0) {
    activePaths.push(groupVolume > 0 ? "maintenance" : "recovery");
  }

  return {
    direction: params.direction,
    entries: enrichedEntries,
    groupVolume,
    previousGroupVolume: params.previousGroupVolume,
    progressThreshold: threshold,
    rollingQuestBaseline: params.rollingQuestBaseline,
    isQuestCompleted,
    activePaths,
  };
}

export function resolveSessionStatus(paths: WorkoutProgressPath[], readiness: ReadinessProfile): WorkoutSessionStatus {
  if (paths.includes("weekly_quest")) {
    return "weekly_quest_complete";
  }
  if (paths.includes("strength")) {
    return "strength_pr";
  }
  if (paths.includes("volume")) {
    return "volume_pr";
  }
  if (readiness.mode === "recovery") {
    return "recovery";
  }
  if (paths.includes("maintenance")) {
    return "maintenance";
  }
  return "progress";
}

export function buildReward(status: WorkoutSessionStatus): WorkoutReward {
  switch (status) {
    case "strength_pr":
      return { title: "Тренировка сохранена — силовой PR", subtitle: "Лучший рабочий сет стал сильнее." };
    case "volume_pr":
      return { title: "Тренировка сохранена — PR по объему", subtitle: "Полезный объем вырос по сравнению с прошлой сессией." };
    case "weekly_quest_complete":
      return { title: "Недельный квест +3% закрыт", subtitle: "Геймифицированная цель недели выполнена." };
    case "recovery":
      return { title: "Тренировка сохранена — восстановление", subtitle: "Легкая сессия тоже работает на долгий прогресс." };
    case "maintenance":
      return { title: "Отличная поддерживающая сессия", subtitle: "Форма сохранена без лишней усталости." };
    default:
      return { title: "Тренировка сохранена — прогресс", subtitle: "Сессия добавлена в историю и готова к следующему шагу." };
  }
}

export function analyzeDirectionProgress(params: {
  direction: TrainingDirection;
  entries: WorkoutDirectionBlockInput["entries"];
  history: WorkoutSession[];
}) {
  const previousVolumes = getRecentDirectionVolumes(params.history, params.direction, 3);
  const previousEntries = getLatestDirectionEntries(params.history, params.direction);
  const previousGroupVolume = previousVolumes[0] ?? null;
  const rollingQuestBaseline = calculateRollingMedian(previousVolumes);

  return buildDirectionResult({
    direction: params.direction,
    entries: params.entries,
    previousGroupVolume,
    rollingQuestBaseline,
    previousEntries,
  });
}

export function updatePersonalRecords(existingRecords: PersonalRecord[], session: WorkoutSession) {
  const records = [...existingRecords];

  session.blocks.forEach((block) => {
    block.entries.forEach((entry) => {
      const bestSet = entry.bestSet;
      if (!bestSet) {
        return;
      }

      const currentIndex = records.findIndex(
        (record) => record.direction === block.direction && record.exerciseName === entry.name,
      );
      const current = currentIndex >= 0 ? records[currentIndex] : undefined;

      const shouldReplace =
        !current ||
        bestSet.weight > current.bestWeight ||
        (bestSet.weight === current.bestWeight &&
          bestSet.reps > current.reps &&
          new Date(session.performedAt).getTime() >= new Date(current.achievedAt).getTime());

      if (!shouldReplace) {
        return;
      }

      const nextRecord: PersonalRecord = {
        id: current?.id ?? createId("pr"),
        direction: block.direction,
        exerciseName: entry.name,
        bestWeight: bestSet.weight,
        reps: bestSet.reps,
        achievedAt: session.performedAt,
      };

      if (currentIndex >= 0) {
        records[currentIndex] = nextRecord;
      } else {
        records.push(nextRecord);
      }
    });
  });

  return records;
}
