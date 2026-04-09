import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { Screen } from "@/components/Screen";
import { getExerciseTechnique, type ExerciseTechnique } from "@/constants/exerciseTechniques";
import { getAlternativeTemplates, getExerciseTemplateById, trainingDirectionLabels } from "@/constants/workoutTemplates";
import { createId } from "@/domain/common";
import {
  defaultReadinessCheck,
  type ReadinessCheck,
  type TrainingDirection,
  type WorkoutExerciseInput,
  type WorkoutFormValues,
  type WorkoutProgressPath,
  workoutFormSchema,
} from "@/domain/workout";
import { SummaryStat } from "@/features/workouts/WorkoutWidgets";
import {
  analyzeWorkoutDraft,
  buildInitialSetEntries,
  buildReadinessProfile,
  findNextUnfinishedExerciseKey,
  getExerciseCompletionProgress,
  markExerciseCompleted,
  reopenCompletedExercise as reopenCompletedExerciseEntry,
  calculateExerciseVolume,
  resolveExpandedExerciseKey,
  createWorkoutSet,
  getBestSet,
} from "@/services/workouts/workoutEngine";
import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";
import { todayIsoDate } from "@/utils/date";
import { formatNumber } from "@/utils/format";

const readinessQuestions: Array<{ key: keyof ReadinessCheck; label: string; low: string; high: string }> = [
  { key: "sleepQuality", label: "Сон", low: "Плохо", high: "Отлично" },
  { key: "energyLevel", label: "Энергия", low: "Низко", high: "Высоко" },
  { key: "muscleSoreness", label: "Забитость", low: "Сильная", high: "Легко" },
  { key: "stress", label: "Стресс", low: "Высокий", high: "Спокойно" },
  { key: "readinessToPush", label: "Готовность", low: "Лайт", high: "Жму" },
];

const progressPathLabels: Record<WorkoutProgressPath, string> = {
  strength: "Сила",
  volume: "Объем",
  weekly_quest: "Недельный квест",
  maintenance: "Поддержание",
  recovery: "Восстановление",
};

const readinessScaleQuestions: Array<{ key: keyof ReadinessCheck; label: string; low: string; high: string }> = [
  { key: "sleepQuality", label: "Сон", low: "Плохо", high: "Отлично" },
  { key: "energyLevel", label: "Энергия", low: "Низко", high: "Высоко" },
  { key: "muscleSoreness", label: "Забитость", low: "Сильная", high: "Низкая" },
  { key: "stress", label: "Стресс", low: "Высокий", high: "Низкий" },
  { key: "readinessToPush", label: "Готовность", low: "Лайт", high: "Жму" },
];

export function WorkoutsScreen() {
  const { width } = useWindowDimensions();
  const selectedDirections = useAppStore((state) => state.selectedDirections);
  const toggleDirection = useAppStore((state) => state.toggleDirection);
  const getTemplateBlocksForDirections = useAppStore((state) => state.getTemplateBlocksForDirections);
  const saveWorkout = useAppStore((state) => state.saveWorkout);
  const setReadinessCheck = useAppStore((state) => state.setReadinessCheck);
  const storedReadinessCheck = useAppStore((state) => state.readinessCheck);
  const workoutHistory = useAppStore((state) => state.workoutHistory);
  const personalRecords = useAppStore((state) => state.personalRecords);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [rewardModal, setRewardModal] = useState<{ title: string; subtitle: string } | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<ExerciseTechnique | null>(null);
  const [activeTechniqueFrame, setActiveTechniqueFrame] = useState(0);
  const [expandedExerciseKey, setExpandedExerciseKey] = useState<string | null>(null);
  const [coachDecision, setCoachDecision] = useState<"pending" | "applied" | "kept">("pending");
  const [replacementContext, setReplacementContext] = useState<{
    blockIndex: number;
    entryIndex: number;
    direction: TrainingDirection;
    activeTemplateId: string;
  } | null>(null);

  const defaultBlocks = useMemo(
    () => getTemplateBlocksForDirections(selectedDirections),
    [getTemplateBlocksForDirections, selectedDirections],
  );

  const { handleSubmit, reset, setValue, getValues, watch } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      directions: selectedDirections,
      performedAt: todayIsoDate(),
      readinessCheck: storedReadinessCheck ?? defaultReadinessCheck,
      blocks: defaultBlocks,
    },
  });

  useEffect(() => {
    reset({
      directions: selectedDirections,
      performedAt: todayIsoDate(),
      readinessCheck: storedReadinessCheck ?? defaultReadinessCheck,
      blocks: getTemplateBlocksForDirections(selectedDirections),
    });
    setCoachDecision("pending");
    setFeedback(null);
  }, [getTemplateBlocksForDirections, reset, selectedDirections, storedReadinessCheck]);

  useEffect(() => {
    setActiveTechniqueFrame(0);
    if (!activeTechnique || activeTechnique.mediaFrames.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveTechniqueFrame((current) => (current + 1) % activeTechnique.mediaFrames.length);
    }, 900);

    return () => clearInterval(interval);
  }, [activeTechnique]);

  const watchedBlocks = watch("blocks");
  const watchedReadiness = watch("readinessCheck");
  const techniqueFrameSource = activeTechnique?.mediaFrames[activeTechniqueFrame] ?? null;

  const draftAnalysis = useMemo(
    () =>
      analyzeWorkoutDraft({
        directions: selectedDirections,
        performedAt: todayIsoDate(),
        readinessCheck: watchedReadiness,
        blocks: watchedBlocks ?? [],
        history: workoutHistory,
        templateNameResolver: (templateId) => getExerciseTemplateById(templateId)?.name ?? null,
      }),
    [selectedDirections, watchedReadiness, watchedBlocks, workoutHistory],
  );

  const replacementOptions = useMemo(() => {
    if (!replacementContext) {
      return [];
    }

    const selectedTemplateIds =
      watchedBlocks?.[replacementContext.blockIndex]?.entries.map((entry) => entry.templateId) ?? [];

    return getAlternativeTemplates(
      replacementContext.direction,
      replacementContext.activeTemplateId,
      selectedTemplateIds,
    );
  }, [replacementContext, watchedBlocks]);

  const aggregateStats = useMemo(() => {
    const currentVolume = draftAnalysis.blockResults.reduce((sum, block) => sum + block.groupVolume, 0);
    const previousVolume = draftAnalysis.blockResults.some((block) => block.previousGroupVolume != null)
      ? draftAnalysis.blockResults.reduce((sum, block) => sum + (block.previousGroupVolume ?? 0), 0)
      : null;
    const questTarget = draftAnalysis.blockResults.reduce((sum, block) => {
      if (block.rollingQuestBaseline == null) {
        return sum;
      }

      return sum + Number((block.rollingQuestBaseline * 1.03).toFixed(2));
    }, 0);
    const remainingQuestVolume = Math.max(questTarget - currentVolume, 0);
    const { completedExercises, totalExercises } = getExerciseCompletionProgress(watchedBlocks ?? []);

    return {
      currentVolume,
      previousVolume,
      questTarget,
      remainingQuestVolume,
      completedExercises,
      totalExercises,
    };
  }, [draftAnalysis.blockResults, watchedBlocks]);

  useEffect(() => {
    setExpandedExerciseKey((currentKey) => resolveExpandedExerciseKey(watchedBlocks ?? [], currentKey));
  }, [expandedExerciseKey, watchedBlocks]);

  const setReadinessValue = (key: keyof ReadinessCheck, value: number) => {
    setValue(`readinessCheck.${key}`, value, { shouldDirty: true, shouldTouch: true });
    setReadinessCheck({ ...getValues("readinessCheck"), [key]: value });
    setCoachDecision("pending");
  };

  const updateExercise = (
    blockIndex: number,
    entryIndex: number,
    updater: (entry: WorkoutExerciseInput) => WorkoutExerciseInput,
  ) => {
    const currentBlocks = getValues("blocks") ?? [];
    const nextBlocks = currentBlocks.map((block, currentBlockIndex) => {
      if (currentBlockIndex !== blockIndex) {
        return block;
      }

      return {
        ...block,
        entries: block.entries.map((entry, currentEntryIndex) =>
          currentEntryIndex === entryIndex ? updater(entry) : entry,
        ),
      };
    });

    setValue("blocks", nextBlocks, { shouldDirty: true, shouldTouch: true });
    return nextBlocks;
  };

  const updateSetField = (
    blockIndex: number,
    entryIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) => {
    updateExercise(blockIndex, entryIndex, (entry) => ({
      ...entry,
      isCompleted: false,
      setEntries: entry.setEntries.map((setEntry, currentIndex) =>
        currentIndex === setIndex ? { ...setEntry, [field]: Number(value || 0) } : setEntry,
      ),
    }));
  };

  const addSet = (blockIndex: number, entryIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => ({
      ...entry,
      setEntries: [...entry.setEntries, createWorkoutSet()],
      isCompleted: false,
    }));
  };

  const repeatPreviousSet = (blockIndex: number, entryIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => {
      const lastSet = entry.setEntries[entry.setEntries.length - 1];
      const nextSet = lastSet
        ? { ...lastSet, id: createId("set"), isCompleted: false }
        : createWorkoutSet();

      return {
        ...entry,
        setEntries: [...entry.setEntries, nextSet],
        isCompleted: false,
      };
    });
  };

  const loadPreviousScheme = (blockIndex: number, entryIndex: number) => {
    const entry = getValues(`blocks.${blockIndex}.entries.${entryIndex}` as const);
    const previousEntry = workoutHistory
      .flatMap((session) => session.blocks.flatMap((block) => block.entries))
      .find((historyEntry) => historyEntry.name === entry.name);

    if (!previousEntry) {
      return;
    }

    updateExercise(blockIndex, entryIndex, (currentEntry) => ({
      ...currentEntry,
      isCompleted: false,
      setEntries: previousEntry.setEntries.map((setEntry) => ({
        id: createId("set"),
        weight: setEntry.weight,
        reps: setEntry.reps,
        type: setEntry.type,
        isCompleted: false,
      })),
    }));
  };

  const toggleSetType = (blockIndex: number, entryIndex: number, setIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => ({
      ...entry,
      isCompleted: false,
      setEntries: entry.setEntries.map((setEntry, currentIndex) =>
        currentIndex === setIndex
          ? { ...setEntry, type: setEntry.type === "normal" ? "warmup" : "normal" }
          : setEntry,
      ),
    }));
  };

  const toggleSetCompleted = (blockIndex: number, entryIndex: number, setIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => ({
      ...entry,
      setEntries: entry.setEntries.map((setEntry, currentIndex) =>
        currentIndex === setIndex ? { ...setEntry, isCompleted: !setEntry.isCompleted } : setEntry,
      ),
    }));
  };

  const deleteSet = (blockIndex: number, entryIndex: number, setIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => ({
      ...entry,
      isCompleted: false,
      setEntries:
        entry.setEntries.length === 1
          ? entry.setEntries
          : entry.setEntries.filter((_, currentIndex) => currentIndex !== setIndex),
    }));
  };

  const completeExercise = (blockIndex: number, entryIndex: number) => {
    const nextBlocks = updateExercise(blockIndex, entryIndex, (entry) => markExerciseCompleted(entry));
    setExpandedExerciseKey(findNextUnfinishedExerciseKey(nextBlocks, blockIndex, entryIndex));
  };

  const reopenExercise = (blockIndex: number, entryIndex: number) => {
    updateExercise(blockIndex, entryIndex, (entry) => reopenCompletedExerciseEntry(entry));
    setExpandedExerciseKey(`${blockIndex}:${entryIndex}`);
  };

  const handleReplaceExercise = (templateId: string) => {
    if (!replacementContext) {
      return;
    }

    const nextTemplate = getExerciseTemplateById(templateId);
    if (!nextTemplate) {
      return;
    }

    updateExercise(replacementContext.blockIndex, replacementContext.entryIndex, () => ({
      templateId: nextTemplate.id,
      name: nextTemplate.name,
      setEntries: buildInitialSetEntries(nextTemplate.defaultWeight, nextTemplate.defaultReps, nextTemplate.defaultSets),
      isCompleted: false,
    }));

    setExpandedExerciseKey(`${replacementContext.blockIndex}:${replacementContext.entryIndex}`);
    setReplacementContext(null);
  };

  const applyCoachingPlan = () => {
    (watchedBlocks ?? []).forEach((block, blockIndex) => {
      block.entries.forEach((entry, entryIndex) => {
        const recommendation = draftAnalysis.coachingSnapshot.exerciseRecommendations.find(
          (item) => item.exerciseName === entry.name,
        );

        updateExercise(blockIndex, entryIndex, (currentEntry) => {
          const nextTemplate = recommendation?.substituteTemplateId
            ? getExerciseTemplateById(recommendation.substituteTemplateId)
            : null;

          let nextSets = currentEntry.setEntries.map((setEntry) => {
            if (recommendation?.recommendedWeight == null) {
              return { ...setEntry };
            }

            const nextWeight =
              setEntry.type === "warmup"
                ? Math.round(recommendation.recommendedWeight * 0.6 * 2) / 2
                : recommendation.recommendedWeight;

            return {
              ...setEntry,
              weight: nextWeight,
            };
          });

          if (draftAnalysis.coachingSnapshot.recommendedSetDelta > 0) {
            const lastNormalSet = nextSets.filter((setEntry) => setEntry.type === "normal").slice(-1)[0] ?? nextSets[nextSets.length - 1];
            nextSets = [...nextSets, { ...(lastNormalSet ?? createWorkoutSet()), id: createId("set"), isCompleted: false }];
          }

          if (draftAnalysis.coachingSnapshot.recommendedSetDelta < 0) {
            const normalIndexes = nextSets
              .map((setEntry, index) => ({ setEntry, index }))
              .filter(({ setEntry }) => setEntry.type === "normal");
            if (normalIndexes.length > 2) {
              const removeIndex = normalIndexes[normalIndexes.length - 1]?.index;
              nextSets = nextSets.filter((_, index) => index !== removeIndex);
            }
          }

          return {
            templateId: nextTemplate?.id ?? currentEntry.templateId,
            name: nextTemplate?.name ?? currentEntry.name,
            setEntries: nextSets,
            isCompleted: false,
          };
        });
      });
    });

    setCoachDecision("applied");
    setFeedback("Рекомендации коуча применены к текущему плану.");
  };

  const onSubmit = handleSubmit((values) => {
    const result = saveWorkout(values);
    setRewardModal(result.reward);
    setFeedback(result.reason);
    setCoachDecision("pending");
  });

  return (
    <Screen
      contentContainerStyle={styles.screenContent}
      stickyFooter={
        <View style={styles.stickyShell}>
          <View style={styles.stickyBar}>
            <View style={styles.stickyMetricGroup}>
              <View style={styles.stickyMetric}>
                <Text style={styles.stickyLabel}>Текущий объем</Text>
                <Text style={styles.stickyValue}>{formatNumber(aggregateStats.currentVolume)}</Text>
              </View>
              <View style={styles.stickyMetric}>
                <Text style={styles.stickyLabel}>До недельного квеста</Text>
                <Text style={[styles.stickyValue, aggregateStats.remainingQuestVolume === 0 ? styles.stickyValueAccent : null]}>
                  {formatNumber(aggregateStats.remainingQuestVolume)}
                </Text>
              </View>
            </View>

            <Pressable onPress={onSubmit} style={({ pressed }) => [styles.stickyCta, pressed ? styles.pressed : null]}>
              <Text style={styles.stickyCtaText}>Сохранить тренировку</Text>
            </Pressable>
          </View>
          {feedback ? <Text style={styles.stickyFeedback}>{feedback}</Text> : null}
        </View>
      }
    >
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Сегодня</Text>
              <Text style={styles.title}>Тренируйся системно</Text>
              <Text style={styles.subtitle}>
                Фиксируй подходы, держи структуру по мышечным блокам и собирай историю прогресса без лишнего визуального шума.
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <SummaryStat label="Объём" value={formatNumber(aggregateStats.currentVolume)} accent="green" />
            <SummaryStat
              label="Прошлый"
              value={aggregateStats.previousVolume == null ? "Нет базы" : formatNumber(aggregateStats.previousVolume)}
            />
            <SummaryStat label="Режим" value={draftAnalysis.coachingSnapshot.readiness.label} accent="violet" />
            <SummaryStat
              label="Цель +3%"
              value={aggregateStats.questTarget > 0 ? formatNumber(aggregateStats.questTarget) : "Скоро"}
            />
          </View>

        </View>

        <View style={styles.segmentedWrap}>
          <Text style={styles.sectionLabel}>Мышечные группы</Text>
          <View style={styles.segmentedTabs}>
            {(Object.keys(trainingDirectionLabels) as TrainingDirection[]).map((direction) => {
              const active = selectedDirections.includes(direction);
              return (
                <Pressable
                  key={direction}
                  onPress={() => {
                    toggleDirection(direction);
                    setCoachDecision("pending");
                  }}
                  style={({ pressed }) => [styles.segmentedTab, active ? styles.segmentedTabActive : null, pressed ? styles.pressed : null]}
                >
                  <Text style={[styles.segmentedTabText, active ? styles.segmentedTabTextActive : null]}>
                    {trainingDirectionLabels[direction]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.blocksList}>
          {draftAnalysis.blockResults.map((block, blockIndex) => (
            <View key={`${block.direction}_${blockIndex}`} style={styles.blockCard}>
              <View style={styles.blockHeader}>
                <View style={styles.blockHeaderCopy}>
                  <Text style={styles.blockTitle}>{trainingDirectionLabels[block.direction]}</Text>
                  <Text style={styles.blockMeta}>
                    Объем {formatNumber(block.groupVolume)} • квест {block.isQuestCompleted ? "выполнен" : "в процессе"}
                  </Text>
                </View>
                <View style={styles.blockMetaPill}>
                  <Text style={styles.blockMetaPillText}>
                    {block.entries.filter((entry) => entry.isCompleted).length}/{block.entries.length}
                  </Text>
                </View>
              </View>

              {block.entries.map((entry, entryIndex) => {
                const exerciseKey = `${blockIndex}:${entryIndex}`;
                const isExpanded = expandedExerciseKey === exerciseKey || !entry.isCompleted;
                const previousSchemeAvailable = workoutHistory.some((session) =>
                  session.blocks.some((historyBlock) => historyBlock.entries.some((historyEntry) => historyEntry.name === entry.name)),
                );
                const bestSet = getBestSet(entry);
                const recommendation = draftAnalysis.coachingSnapshot.exerciseRecommendations.find(
                  (item) => item.exerciseName === entry.name,
                );

                if (!isExpanded && entry.isCompleted) {
                  return (
                    <Pressable
                      key={exerciseKey}
                      onPress={() => setExpandedExerciseKey(exerciseKey)}
                      style={({ pressed }) => [styles.collapsedCard, pressed ? styles.pressed : null]}
                    >
                      <View style={styles.collapsedLeading}>
                        <View style={styles.completedDot}>
                          <Text style={styles.completedDotText}>✓</Text>
                        </View>
                        <View>
                          <Text style={styles.collapsedTitle}>{entry.name}</Text>
                          <Text style={styles.collapsedMeta}>
                            {bestSet ? `Лучший сет: ${bestSet.weight} × ${bestSet.reps}` : "Упражнение завершено"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.collapsedVolume}>{formatNumber(calculateExerciseVolume(entry))} кг</Text>
                    </Pressable>
                  );
                }

                return (
                  <View key={exerciseKey} style={[styles.exerciseCard, expandedExerciseKey === exerciseKey ? styles.exerciseCardActive : null]}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseHeaderTop}>
                        <View style={styles.exerciseHeaderCopy}>
                          <Text style={styles.exerciseIndex}>{entryIndex + 1}</Text>
                          <View style={styles.exerciseTitleWrap}>
                            <Text numberOfLines={2} style={styles.exerciseName}>
                              {entry.name}
                            </Text>
                          </View>
                        </View>
                        <Pressable
                          onPress={() => setActiveTechnique(getExerciseTechnique(entry.templateId, entry.name, block.direction))}
                          style={({ pressed }) => [styles.exerciseActionPrimary, pressed ? styles.pressed : null]}
                        >
                          <Text style={styles.exerciseActionPrimaryText}>Техника</Text>
                        </Pressable>
                      </View>

                      <View style={styles.exerciseHeaderBottom}>
                        <Pressable
                          onPress={() =>
                            setReplacementContext({
                              blockIndex,
                              entryIndex,
                              direction: block.direction,
                              activeTemplateId: entry.templateId,
                            })
                          }
                          style={({ pressed }) => [styles.exerciseActionSecondary, pressed ? styles.pressed : null]}
                        >
                          <Text style={styles.exerciseActionSecondaryText}>Заменить</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.setList}>
                      {entry.setEntries.map((setEntry, setIndex) => (
                        <View key={setEntry.id} style={styles.setRow}>
                          <Pressable
                            onPress={() => toggleSetType(blockIndex, entryIndex, setIndex)}
                            style={({ pressed }) => [
                              styles.setIndexPill,
                              setEntry.type === "warmup" ? styles.setIndexPillWarmup : null,
                              pressed ? styles.pressed : null,
                            ]}
                          >
                            <Text style={styles.setIndexText}>
                              {setEntry.type === "warmup" ? `W${setIndex + 1}` : setIndex + 1}
                            </Text>
                          </Pressable>

                          <View style={styles.setInputWrap}>
                            <Text style={styles.setInputLabel}>Вес</Text>
                            <TextInput
                              value={String(setEntry.weight ?? "")}
                              onChangeText={(value) => updateSetField(blockIndex, entryIndex, setIndex, "weight", value)}
                              keyboardType="numeric"
                              style={styles.setInput}
                            />
                          </View>

                          <View style={styles.setInputWrap}>
                            <Text style={styles.setInputLabel}>Повт.</Text>
                            <TextInput
                              value={String(setEntry.reps ?? "")}
                              onChangeText={(value) => updateSetField(blockIndex, entryIndex, setIndex, "reps", value)}
                              keyboardType="numeric"
                              style={styles.setInput}
                            />
                          </View>

                          <Pressable
                            onPress={() => toggleSetCompleted(blockIndex, entryIndex, setIndex)}
                            style={({ pressed }) => [
                              styles.setActionIcon,
                              setEntry.isCompleted ? styles.setActionIconDone : null,
                              pressed ? styles.pressed : null,
                            ]}
                          >
                            <Text style={styles.setActionIconText}>{setEntry.isCompleted ? "✓" : "○"}</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => deleteSet(blockIndex, entryIndex, setIndex)}
                            style={({ pressed }) => [styles.setActionIcon, pressed ? styles.pressed : null]}
                          >
                            <Text style={styles.setActionDeleteText}>×</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <View style={styles.exerciseControls}>
                      <Pressable onPress={() => addSet(blockIndex, entryIndex)} style={({ pressed }) => [styles.controlChip, pressed ? styles.pressed : null]}>
                        <Text style={styles.controlChipText}>Добавить подход</Text>
                      </Pressable>
                      <Pressable onPress={() => repeatPreviousSet(blockIndex, entryIndex)} style={({ pressed }) => [styles.controlChip, pressed ? styles.pressed : null]}>
                        <Text style={styles.controlChipText}>Повторить прошлый подход</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => loadPreviousScheme(blockIndex, entryIndex)}
                        disabled={!previousSchemeAvailable}
                        style={({ pressed }) => [
                          styles.controlChip,
                          !previousSchemeAvailable ? styles.controlChipDisabled : null,
                          pressed ? styles.pressed : null,
                        ]}
                      >
                        <Text style={[styles.controlChipText, !previousSchemeAvailable ? styles.controlChipTextDisabled : null]}>
                          Загрузить прошлую схему
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.exerciseFooter}>
                      <View>
                        <Text style={styles.exerciseVolumeLabel}>Объем упражнения</Text>
                        <Text style={styles.exerciseVolumeValue}>{formatNumber(calculateExerciseVolume(entry))}</Text>
                      </View>
                      <Pressable onPress={() => (entry.isCompleted ? reopenExercise(blockIndex, entryIndex) : completeExercise(blockIndex, entryIndex))} style={({ pressed }) => [styles.completeButton, pressed ? styles.pressed : null]}>
                        <Text style={styles.completeButtonText}>
                          {entry.isCompleted ? "Вернуть в работу" : "Завершить упражнение"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {selectedDirections.map((direction) => {
          const relevantRecords = personalRecords.filter((record) => record.direction === direction).slice(0, 3);
          if (relevantRecords.length === 0) {
            return null;
          }

          return (
            <View key={`pr_${direction}`} style={styles.prCard}>
              <Text style={styles.sectionLabel}>PR</Text>
              <Text style={styles.sectionTitle}>{trainingDirectionLabels[direction]}</Text>
              {relevantRecords.map((record) => (
                <View key={record.id} style={styles.prRow}>
                  <Text style={styles.prName}>{record.exerciseName}</Text>
                  <Text style={styles.prMeta}>
                    {record.bestWeight} кг × {record.reps} • {record.achievedAt.slice(0, 10)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      <Modal transparent animationType="fade" visible={Boolean(activeTechnique)} onRequestClose={() => setActiveTechnique(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setActiveTechnique(null)} />
          {activeTechnique ? (
            <View style={[styles.modalCard, width >= 960 ? styles.modalCardWide : null]}>
              <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderCopy}>
                    <Text style={styles.sectionLabel}>Техника</Text>
                    <Text style={styles.sectionTitle}>{activeTechnique.title}</Text>
                    <Text style={styles.modalSummary}>{activeTechnique.summary}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Закрыть окно техники"
                    onPress={() => setActiveTechnique(null)}
                    style={({ pressed }) => [styles.modalCloseButton, pressed ? styles.pressed : null]}
                  >
                    <Text style={styles.modalCloseButtonText}>×</Text>
                  </Pressable>
                </View>

                <View style={[styles.techniqueLayout, width >= 960 ? styles.techniqueLayoutWide : null]}>
                  <View style={styles.mediaFrame}>
                    {techniqueFrameSource ? <Image source={techniqueFrameSource} style={styles.media} resizeMode="contain" /> : null}
                    <Text style={styles.mediaCaption}>{activeTechnique.sourceLabel}</Text>
                  </View>
                  <View style={styles.cuesCard}>
                    <Text style={styles.cuesTitle}>Коучинг-акценты</Text>
                    {activeTechnique.cues.map((cue) => (
                      <View key={cue} style={styles.cueRow}>
                        <View style={styles.cueDot} />
                        <Text style={styles.cueText}>{cue}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={Boolean(replacementContext)} onRequestClose={() => setReplacementContext(null)}>
        <View style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setReplacementContext(null)} />
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sectionLabel}>Замена упражнения</Text>
            <Text style={styles.sectionTitle}>Выбери аналог</Text>
            <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
              {replacementOptions.length === 0 ? (
                <View style={styles.sheetEmptyState}>
                  <Text style={styles.sheetEmptyTitle}>Свободных аналогов не осталось</Text>
                  <Text style={styles.sheetEmptyText}>
                    В этом блоке уже используются остальные подходящие упражнения. Открой другой блок или оставь текущее движение.
                  </Text>
                </View>
              ) : null}
              {replacementOptions.map((option) => (
                <Pressable key={option.id} onPress={() => handleReplaceExercise(option.id)} style={({ pressed }) => [styles.sheetOption, pressed ? styles.pressed : null]}>
                  <View style={styles.sheetOptionCopy}>
                    <Text style={styles.sheetOptionName}>{option.name}</Text>
                    <Text style={styles.sheetOptionMeta}>
                      {option.defaultWeight} кг • {option.defaultReps} повторов • {option.defaultSets} подхода
                    </Text>
                  </View>
                  <Text style={styles.sheetOptionAction}>Выбрать</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={Boolean(rewardModal)} onRequestClose={() => setRewardModal(null)}>
        <View style={styles.rewardBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setRewardModal(null)} />
          {rewardModal ? (
            <View style={styles.rewardCard}>
              <Text style={styles.sectionLabel}>Workout saved</Text>
              <Text style={styles.rewardTitle}>{rewardModal.title}</Text>
              <Text style={styles.rewardSubtitle}>{rewardModal.subtitle}</Text>
              <Pressable onPress={() => setRewardModal(null)} style={({ pressed }) => [styles.primaryAction, pressed ? styles.pressed : null]}>
                <Text style={styles.primaryActionText}>Продолжить</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 164,
  },
  shell: {
    width: "100%",
    maxWidth: 1160,
    alignSelf: "center",
    gap: appTheme.spacing.md,
  },
  hero: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 28,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 760,
  },
  readinessBadge: {
    minWidth: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#12171D",
    borderWidth: 1,
    borderColor: "rgba(124,140,255,0.2)",
    gap: 6,
    alignItems: "flex-end",
  },
  readinessBadgeLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  readinessBadgeValue: {
    color: appTheme.colors.accentSoft,
    fontSize: 24,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: appTheme.spacing.sm,
  },
  pathBlock: {
    gap: appTheme.spacing.sm,
  },
  pathHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
  },
  pathMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  pathRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.xs,
  },
  pathPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  pathPillActive: {
    backgroundColor: "#16211A",
    borderColor: "rgba(34,197,94,0.22)",
  },
  pathPillText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  pathPillTextActive: {
    color: appTheme.colors.textPrimary,
  },
  readinessCard: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 28,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  readinessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: appTheme.spacing.md,
  },
  sectionLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  readinessModeText: {
    color: appTheme.colors.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  readinessRow: {
    gap: appTheme.spacing.sm,
  },
  readinessQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
  },
  readinessQuestionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  readinessQuestionMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  readinessScale: {
    flexDirection: "row",
    gap: 8,
  },
  readinessScaleButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  readinessScaleButtonActive: {
    backgroundColor: "rgba(124,140,255,0.16)",
    borderColor: "rgba(124,140,255,0.52)",
    shadowColor: "#7C8CFF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  readinessScaleText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  readinessScaleTextActive: {
    color: "#E8ECFF",
  },
  coachCard: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 28,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.14)",
  },
  coachHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
  },
  coachHeaderCopy: {
    flex: 1,
  },
  modeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#16211A",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
    alignSelf: "flex-start",
  },
  modeBadgeText: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  coachLead: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  coachHighlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  coachHighlightCard: {
    flex: 1,
    minWidth: 120,
    padding: appTheme.spacing.md,
    borderRadius: 20,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    gap: 6,
  },
  coachHighlightLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  coachHighlightValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  substitutionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#151A20",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  substitutionText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
  },
  coachActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  primaryAction: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.accent,
  },
  primaryActionText: {
    color: appTheme.colors.textInverse,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  secondaryActionText: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentedWrap: {
    gap: appTheme.spacing.sm,
  },
  segmentedTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.xs,
    padding: 6,
    borderRadius: 24,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  segmentedTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentedTabActive: {
    backgroundColor: "#1A2129",
    borderColor: "rgba(124,140,255,0.18)",
  },
  segmentedTabText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentedTabTextActive: {
    color: appTheme.colors.textPrimary,
  },
  blocksList: {
    gap: appTheme.spacing.md,
  },
  blockCard: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 28,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: appTheme.spacing.md,
  },
  blockHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  blockTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  blockMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
  },
  blockMetaPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  blockMetaPillText: {
    color: appTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  collapsedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
  },
  collapsedLeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: appTheme.spacing.sm,
  },
  completedDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  completedDotText: {
    color: appTheme.colors.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  collapsedTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  collapsedMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  collapsedVolume: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  exerciseCard: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
    borderRadius: 24,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  exerciseCardActive: {
    borderColor: "rgba(124,140,255,0.24)",
    shadowColor: "#7C8CFF",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  exerciseHeader: {
    gap: appTheme.spacing.sm,
  },
  exerciseHeaderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: appTheme.spacing.sm,
  },
  exerciseHeaderCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: appTheme.spacing.sm,
    minWidth: 0,
  },
  exerciseTitleWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  exerciseIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: "center",
    textAlignVertical: "center",
    color: appTheme.colors.textPrimary,
    backgroundColor: "#101419",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 30,
  },
  exerciseName: {
    color: appTheme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    flexShrink: 1,
  },
  exerciseHeaderBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appTheme.spacing.sm,
    flexWrap: "wrap",
  },
  exerciseRecommendationBadge: {
    flex: 1,
    minWidth: 170,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  exerciseRecommendationLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exerciseRecommendationText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseActionSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  exerciseActionSecondaryText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  exerciseActionPrimary: {
    minWidth: 92,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#111A13",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseActionPrimaryText: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  setList: {
    gap: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  setIndexPill: {
    width: 42,
    minHeight: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171C22",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  setIndexPillWarmup: {
    backgroundColor: "#2A2213",
    borderColor: "rgba(245,158,11,0.18)",
  },
  setIndexText: {
    color: appTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  setInputWrap: {
    flex: 1,
    gap: 6,
  },
  setInputLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  setInput: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    color: appTheme.colors.textPrimary,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
  },
  setActionIcon: {
    width: 40,
    minHeight: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171C22",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  setActionIconDone: {
    backgroundColor: "#16211A",
    borderColor: "rgba(34,197,94,0.22)",
  },
  setActionIconText: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  setActionDeleteText: {
    color: appTheme.colors.danger,
    fontSize: 18,
    fontWeight: "800",
  },
  exerciseControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  controlChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  controlChipDisabled: {
    opacity: 0.45,
  },
  controlChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  controlChipTextDisabled: {
    color: appTheme.colors.textMuted,
  },
  exerciseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  exerciseVolumeLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  exerciseVolumeValue: {
    marginTop: 4,
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  completeButton: {
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16211A",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.22)",
  },
  completeButtonText: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  prCard: {
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.lg,
    borderRadius: 24,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  prRow: {
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  prName: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  prMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  stickyShell: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(11,13,16,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: appTheme.spacing.md,
    padding: 12,
    borderRadius: 24,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  stickyMetricGroup: {
    flex: 1,
    flexDirection: "row",
    gap: appTheme.spacing.sm,
  },
  stickyMetric: {
    flex: 1,
    gap: 4,
  },
  stickyLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  stickyValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  stickyValueAccent: {
    color: appTheme.colors.accent,
  },
  stickyCta: {
    minHeight: 56,
    minWidth: 190,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.accent,
    paddingHorizontal: 18,
  },
  stickyCtaText: {
    color: appTheme.colors.textInverse,
    fontSize: 14,
    fontWeight: "800",
  },
  stickyFeedback: {
    marginTop: 8,
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: appTheme.spacing.lg,
  },
  modalCard: {
    maxHeight: "86%",
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    borderRadius: 32,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    overflow: "hidden",
  },
  modalCardWide: {
    maxWidth: 980,
  },
  modalContent: {
    padding: appTheme.spacing.xl,
    gap: appTheme.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: appTheme.spacing.md,
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151A20",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  modalCloseButtonText: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  modalSummary: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  techniqueLayout: {
    gap: appTheme.spacing.lg,
  },
  techniqueLayoutWide: {
    flexDirection: "row",
  },
  mediaFrame: {
    flex: 1.2,
    minHeight: 420,
    padding: appTheme.spacing.md,
    borderRadius: 28,
    backgroundColor: "#0D1116",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.12)",
    gap: 12,
  },
  media: {
    flex: 1,
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#0A0D11",
  },
  mediaCaption: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  cuesCard: {
    flex: 1,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 28,
    backgroundColor: "#151A20",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  cuesTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  cueRow: {
    flexDirection: "row",
    gap: 10,
  },
  cueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    backgroundColor: appTheme.colors.accent,
  },
  cueText: {
    flex: 1,
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.56)",
  },
  sheetCard: {
    maxHeight: "72%",
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: 10,
    paddingBottom: appTheme.spacing.xl,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#11161B",
    borderTopWidth: 1,
    borderColor: appTheme.colors.border,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: appTheme.spacing.md,
  },
  sheetList: {
    marginTop: appTheme.spacing.lg,
  },
  sheetListContent: {
    gap: appTheme.spacing.sm,
    paddingBottom: appTheme.spacing.xl,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  sheetOptionCopy: {
    flex: 1,
    gap: 4,
  },
  sheetOptionName: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  sheetOptionMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  sheetEmptyState: {
    gap: 6,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  sheetEmptyTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  sheetEmptyText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  sheetOptionAction: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  rewardBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: appTheme.spacing.lg,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  rewardCard: {
    width: "100%",
    maxWidth: 420,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.xl,
    borderRadius: 28,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
  },
  rewardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  rewardSubtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.84,
  },
});
