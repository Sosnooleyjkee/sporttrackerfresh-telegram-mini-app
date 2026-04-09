import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Screen } from "@/components/Screen";
import { trainingDirectionLabels } from "@/constants/workoutTemplates";
import {
  DataRow,
  HistoryHeroStat,
  InsightCard,
  MetricPanel,
  SessionStatusPill,
  SurfaceSection,
  TimelineBar,
} from "@/features/history/HistoryWidgets";
import { WorkoutHistoryRepository } from "@/repositories/workouts/WorkoutHistoryRepository";
import {
  getMuscleAnalytics,
  getQuestAndStreakSummary,
  getRecentlyBrokenPRs,
  getRecentSessionSummaries,
  getStrengthChangeSummary,
  getTopLiftHighlights,
} from "@/services/workouts/WorkoutAnalyticsQueryService";
import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";
import { formatNumber } from "@/utils/format";

const sessionStatusLabels = {
  progress: "Прогресс",
  strength_pr: "Силовой PR",
  volume_pr: "PR по объему",
  maintenance: "Поддержание",
  recovery: "Восстановление",
  weekly_quest_complete: "Недельный квест",
} as const;

const muscleLabels = {
  chest: "Грудь",
  back: "Спина",
  shoulders: "Плечи",
  arms: "Руки",
  legs: "Ноги",
} as const;

function formatDateLabel(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));
}

function joinDirections(directions: Array<keyof typeof trainingDirectionLabels>) {
  return directions.map((direction) => trainingDirectionLabels[direction]).join(" · ");
}

function getPathLabel(path: string) {
  switch (path) {
    case "strength":
      return "Сила";
    case "volume":
      return "Объем";
    case "weekly_quest":
      return "Квест";
    case "maintenance":
      return "Поддержание";
    case "recovery":
      return "Восстановление";
    default:
      return path;
  }
}

export function HistoryScreen() {
  const { width } = useWindowDimensions();
  const workoutHistory = useAppStore((state) => state.workoutHistory);
  const personalRecords = useAppStore((state) => state.personalRecords);
  const questionnaire = useAppStore((state) => state.questionnaire);

  const recentSessions = useMemo(
    () => getRecentSessionSummaries(WorkoutHistoryRepository.loadRecentSessions(workoutHistory, 8), 8),
    [workoutHistory],
  );
  const topLifts = useMemo(() => getTopLiftHighlights(personalRecords, 5), [personalRecords]);
  const strengthChanges = useMemo(
    () => getStrengthChangeSummary(personalRecords, workoutHistory, 30),
    [personalRecords, workoutHistory],
  );
  const recentPrs = useMemo(() => getRecentlyBrokenPRs(personalRecords, 6), [personalRecords]);
  const streaks = useMemo(
    () => getQuestAndStreakSummary(workoutHistory, questionnaire.weeklyTrainingTarget),
    [questionnaire.weeklyTrainingTarget, workoutHistory],
  );
  const muscleAnalytics = useMemo(() => getMuscleAnalytics(workoutHistory), [workoutHistory]);

  const isWide = width >= 920;
  const totalQuestHits = workoutHistory.filter((session) => session.activePaths.includes("weekly_quest")).length;

  return (
    <Screen>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>История и аналитика</Text>
              <Text style={styles.heroTitle}>Прогресс, к которому хочется возвращаться</Text>
              <Text style={styles.heroDescription}>
                История тренировок, готовность и пути прогресса собраны в один премиальный экран, чтобы пользователь открывал приложение не только в зале, но и ради ощущения роста.
              </Text>
            </View>
          </View>

          <View style={[styles.heroStatsRow, isWide ? styles.heroStatsRowWide : null]}>
            <HistoryHeroStat
              label="Сессий"
              value={`${workoutHistory.length}`}
              note={
                workoutHistory.length > 0
                  ? "Живая история тренировок уже формирует рекомендации."
                  : "История появится после первой сохранённой тренировки."
              }
            />
            <HistoryHeroStat
              label="Закрыто квестов"
              value={`${totalQuestHits}`}
              note="Сколько раз недельный квест уже был закрыт."
            />
            <HistoryHeroStat
              label="Средняя готовность"
              value={`${streaks.completedWeeks}`}
              note="Средний уровень готовности за последние тренировки."
            />
            <HistoryHeroStat
              label="Текущий стрик"
              value={`${streaks.weeklyQuestStreak}`}
              note="Подряд идущие недели с закрытым недельным квестом."
            />
          </View>
        </View>

        <SurfaceSection
          eyebrow="Последние сессии"
          title="Что происходило в последних тренировках"
          description="Направления, итоговый статус, объем и активные пути прогресса без необходимости открывать каждую тренировку отдельно."
        >
          <View style={styles.stack}>
            {recentSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>История пока пустая</Text>
                <Text style={styles.emptyText}>
                  Как только пользователь сохранит тренировку, здесь появятся сессии, пути прогресса и контекст по готовности.
                </Text>
              </View>
            ) : (
              recentSessions.map((session) => (
                <DataRow
                  key={session.id}
                  title={`${joinDirections(session.directions)} — ${sessionStatusLabels[session.status]}`}
                  subtitle={`${formatDateLabel(session.performedAt)} · Объем ${formatNumber(session.totalVolume)} · готовность ${session.readinessScore}%`}
                  trailing={formatNumber(session.totalVolume)}
                >
                  <View style={styles.pillRow}>
                    {session.activePaths.map((path) => (
                      <SessionStatusPill key={path} label={getPathLabel(path)} active />
                    ))}
                  </View>
                </DataRow>
              ))
            )}
          </View>
        </SurfaceSection>

        <SurfaceSection
          eyebrow="Трекер PR"
          title="Силовые ориентиры"
          description="Лучшие сеты, свежие рекорды и сдвиг по силе за последние 30 дней. Это главный дофаминовый модуль для повторных открытий приложения."
        >
          <View style={[styles.metricGrid, isWide ? styles.metricGridWide : null]}>
            <MetricPanel
              label="Топ-упражнения"
              value={`${topLifts.length}`}
              note={
                topLifts[0]
                  ? `${topLifts[0].exerciseName}: ${topLifts[0].bestWeight} × ${topLifts[0].reps}`
                  : "Рекорды появятся после первых сохранённых лучших сетов."
              }
              accent="green"
            />
            <MetricPanel
              label="Свежие PR"
              value={`${recentPrs.length}`}
              note={
                recentPrs[0]
                  ? `${recentPrs[0].exerciseName} · ${formatDateLabel(recentPrs[0].achievedAt)}`
                  : "Пока без недавно обновлённых рекордов."
              }
              accent="violet"
            />
            <MetricPanel
              label="Сдвиг за 30 дней"
              value={
                strengthChanges[0]
                  ? `${strengthChanges[0].deltaWeight >= 0 ? "+" : ""}${strengthChanges[0].deltaWeight} кг`
                  : "0 кг"
              }
              note={
                strengthChanges[0]
                  ? `${strengthChanges[0].exerciseName} · ${strengthChanges[0].deltaReps >= 0 ? "+" : ""}${strengthChanges[0].deltaReps} повт.`
                  : "Сдвиг появится, когда накопится история за 30 дней."
              }
              accent="amber"
            />
          </View>

          <View style={[styles.dualColumn, isWide ? styles.dualColumnWide : null]}>
            <View style={styles.cardSurface}>
              <Text style={styles.cardTitle}>Топ-упражнения</Text>
              <View style={styles.stack}>
                {topLifts.slice(0, 5).map((record) => (
                  <DataRow
                    key={record.id}
                    title={record.exerciseName}
                    subtitle={`${trainingDirectionLabels[record.direction]} · ${formatDateLabel(record.achievedAt)}`}
                    trailing={`${record.bestWeight} × ${record.reps}`}
                  />
                ))}
              </View>
            </View>

            <View style={styles.cardSurface}>
              <Text style={styles.cardTitle}>Недавние рекорды</Text>
              <View style={styles.stack}>
                {recentPrs.slice(0, 5).map((record) => (
                  <DataRow
                    key={record.id}
                    title={record.exerciseName}
                    subtitle={`${trainingDirectionLabels[record.direction]} · ${formatDateLabel(record.achievedAt)}`}
                    trailing={`${record.bestWeight} × ${record.reps}`}
                  />
                ))}
              </View>
            </View>
          </View>
        </SurfaceSection>

        <SurfaceSection
          eyebrow="Квесты и стрики"
          title="Дисциплина и игровая мотивация"
          description="Геймификация поверх истории: выполнение квестов, соблюдение плана и качество поведения в дни низкой готовности."
        >
          <View style={[styles.metricGrid, isWide ? styles.metricGridWide : null]}>
            <InsightCard title="Стрик квестов" value={`${streaks.weeklyQuestStreak}`} note="Количество недель подряд с закрытым квестом." />
            <InsightCard title="Закрытые недели" value={`${streaks.completedWeeks}`} note="Сколько недель в истории уже содержат закрытый квест." />
            <InsightCard title="Соблюдение плана" value={`${streaks.adherence}%`} note="Сравнение фактических сессий с недельной целью за последние 4 недели." />
            <InsightCard title="Соблюдение восстановления" value={`${streaks.recoveryCompliance}%`} note="Насколько дни с низкой готовностью действительно завершались в мягком режиме." />
            <InsightCard title="Пропущенные сессии" value={`${streaks.missedSessions}`} note="Сколько сессий не хватило до заявленной недельной цели." />
          </View>
        </SurfaceSection>

        <SurfaceSection
          eyebrow="Аналитика мышц"
          title="Нагрузка по мышечным блокам"
          description="Короткая сводка по объёму, частоте и плотности прогресса для ключевых мышечных зон."
        >
          <View style={[styles.metricGrid, isWide ? styles.metricGridWide : null]}>
            {muscleAnalytics.map((item) => (
              <View key={item.key} style={styles.muscleCard}>
                <View style={styles.muscleCardHeader}>
                  <Text style={styles.muscleCardTitle}>{muscleLabels[item.key]}</Text>
                  <SessionStatusPill label={`${item.prDensity}% плотность PR`} active={item.prDensity >= 40} />
                </View>
                <Text style={styles.muscleCardVolume}>{formatNumber(item.latestVolume)}</Text>
                <Text style={styles.muscleCardMeta}>
                  Частота 30д: {item.frequency} · Стагнация: {item.stagnationDays == null ? "нет данных" : `${item.stagnationDays} дн`}
                </Text>
                <TimelineBar points={item.recentVolumes.length > 0 ? item.recentVolumes : [0]} />
              </View>
            ))}
          </View>
        </SurfaceSection>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    gap: appTheme.spacing.lg,
  },
  hero: {
    padding: appTheme.spacing.xl,
    borderRadius: 30,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    gap: appTheme.spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: appTheme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    color: appTheme.colors.accentSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  heroDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 720,
  },
  heroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#151A20",
    borderWidth: 1,
    borderColor: "rgba(124,140,255,0.22)",
    gap: 4,
  },
  heroBadgeLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroBadgeValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  heroStatsRow: {
    gap: appTheme.spacing.md,
  },
  heroStatsRowWide: {
    flexDirection: "row",
  },
  stack: {
    gap: appTheme.spacing.sm,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  metricGrid: {
    gap: appTheme.spacing.md,
  },
  metricGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dualColumn: {
    gap: appTheme.spacing.md,
  },
  dualColumnWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  cardSurface: {
    flex: 1,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 26,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  cardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  timelineLabels: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  timelineLabel: {
    flex: 1,
    color: appTheme.colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  infoStrip: {
    gap: 6,
    padding: appTheme.spacing.md,
    borderRadius: 20,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  infoStripTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  infoStripText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  muscleCard: {
    flex: 1,
    minWidth: 180,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 24,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  muscleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  muscleCardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  muscleCardVolume: {
    color: appTheme.colors.accent,
    fontSize: 28,
    fontWeight: "800",
  },
  muscleCardMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    padding: appTheme.spacing.xl,
    borderRadius: 24,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    gap: appTheme.spacing.sm,
  },
  emptyTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
