import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { ActivityType } from "@/domain/activity";
import {
  ActivityBreakdownItem,
  ActivityChip,
  ActivityStatCard,
  DurationPreset,
  IntegrationCard,
} from "@/features/activity/ActivityWidgets";
import { healthAdapters } from "@/services/health/healthAdapters";
import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";
import { todayIsoDate } from "@/utils/date";

const activityOptions: Array<{
  type: ActivityType;
  label: string;
  shortMeta: string;
  stepBoost: number;
}> = [
  { type: "walking", label: "Ходьба", shortMeta: "Легкая база", stepBoost: 1800 },
  { type: "running", label: "Бег", shortMeta: "Кардио пик", stepBoost: 2400 },
  { type: "cycling", label: "Вело", shortMeta: "Выносливость", stepBoost: 0 },
  { type: "swimming", label: "Бассейн", shortMeta: "Полное тело", stepBoost: 0 },
  { type: "strength", label: "Силовая", shortMeta: "Зал", stepBoost: 350 },
  { type: "hiit", label: "HIIT", shortMeta: "Интервалы", stepBoost: 700 },
  { type: "mobility", label: "Мобилити", shortMeta: "Восстановление", stepBoost: 120 },
  { type: "yoga", label: "Йога", shortMeta: "Баланс", stepBoost: 120 },
  { type: "stairs", label: "Лестница", shortMeta: "Интенсивно", stepBoost: 1100 },
  { type: "boxing", label: "Бокс", shortMeta: "Ударная работа", stepBoost: 900 },
  { type: "team_sport", label: "Игровой спорт", shortMeta: "Матч / спарринг", stepBoost: 1200 },
  { type: "hiking", label: "Треккинг", shortMeta: "Маршрут", stepBoost: 2600 },
  { type: "elliptical", label: "Эллипс", shortMeta: "Ровное кардио", stepBoost: 500 },
  { type: "other", label: "Другое", shortMeta: "Свободный лог", stepBoost: 300 },
];

const durationOptions = [10, 20, 30, 45];

const activityTypeToMinutesKey: Record<ActivityType, keyof ReturnType<typeof getActivitySnapshot>> = {
  walking: "walkingMinutes",
  running: "runningMinutes",
  cycling: "cyclingMinutes",
  swimming: "swimmingMinutes",
  strength: "strengthMinutes",
  hiit: "hiitMinutes",
  mobility: "mobilityMinutes",
  yoga: "yogaMinutes",
  stairs: "stairsMinutes",
  boxing: "boxingMinutes",
  team_sport: "teamSportMinutes",
  hiking: "hikingMinutes",
  elliptical: "ellipticalMinutes",
  other: "otherMinutes",
};

function getActivitySnapshot(activity: ReturnType<typeof useActivityData>) {
  return activity;
}

function useActivityData() {
  return useAppStore(
    (state) =>
      state.dailyActivities.find((item) => item.date === todayIsoDate()) ?? state.dailyActivities[0],
  );
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function getDayStatus(steps: number, activeMinutes: number) {
  if (steps >= 10000 && activeMinutes >= 60) {
    return "День уже выглядит сильно: высокая подвижность и уверенный объём активности.";
  }

  if (steps >= 7000 || activeMinutes >= 40) {
    return "Хороший темп. Добавь ещё один короткий блок активности, чтобы закрепить день.";
  }

  return "Сегодня можно быстро добрать прогресс через один короткий лог активности.";
}

export function ActivityScreen() {
  const { width } = useWindowDimensions();
  const activity = useActivityData();
  const logActivityMinutes = useAppStore((state) => state.logActivityMinutes);
  const [selectedType, setSelectedType] = useState<ActivityType>("walking");
  const [selectedDuration, setSelectedDuration] = useState(20);

  const isWide = width >= 860;
  const selectedConfig = useMemo(
    () => activityOptions.find((item) => item.type === selectedType) ?? activityOptions[0],
    [selectedType],
  );

  const breakdown = useMemo(() => {
    const snapshot = getActivitySnapshot(activity);
    const total = Math.max(snapshot.activeMinutes, 1);

    return activityOptions
      .map((option) => {
        const key = activityTypeToMinutesKey[option.type];
        const minutes = snapshot[key] as number;

        return {
          type: option.type,
          label: option.label,
          minutes,
          share: minutes / total,
        };
      })
      .filter((item) => item.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  }, [activity]);

  const topActivity = breakdown[0];
  const selectedTotal = breakdown.find((item) => item.type === selectedType)?.minutes ?? 0;

  const addSelectedActivity = () => {
    logActivityMinutes({
      type: selectedType,
      minutes: selectedDuration,
      steps: selectedConfig.stepBoost > 0 ? Math.round((selectedConfig.stepBoost * selectedDuration) / 20) : undefined,
    });
  };

  return (
    <Screen>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Сегодня</Text>
              <Text style={styles.heroTitle}>Активность</Text>
              <Text style={styles.heroDate}>{formatTodayLabel()}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeLabel}>Статус дня</Text>
              <Text style={styles.heroBadgeValue}>Сегодня</Text>
            </View>
          </View>

          <View style={[styles.heroMetrics, isWide ? styles.heroMetricsWide : null]}>
            <View style={styles.heroMetricBlock}>
              <Text style={styles.heroMetricValue}>{activity.steps.toLocaleString("ru-RU")}</Text>
              <Text style={styles.heroMetricLabel}>шагов</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroMetricBlock}>
              <Text style={styles.heroMetricValue}>{activity.activeMinutes}</Text>
              <Text style={styles.heroMetricLabel}>активных минут</Text>
            </View>
          </View>

          <Text style={styles.heroStatus}>{getDayStatus(activity.steps, activity.activeMinutes)}</Text>
        </View>

        <View style={[styles.statsGrid, isWide ? styles.statsGridWide : null]}>
          <ActivityStatCard
            label="Шаги"
            value={activity.steps.toLocaleString("ru-RU")}
            note={
              topActivity
                ? `Основной вклад: ${topActivity.label.toLowerCase()}`
                : "Пока без детального вклада по типам активности"
            }
            accent="green"
          />
          <ActivityStatCard
            label="Активные минуты"
            value={`${activity.activeMinutes}`}
            note={
              topActivity
                ? `${topActivity.minutes} мин в блоке «${topActivity.label}»`
                : "Добавь первый блок активности, чтобы заполнить день"
            }
            accent="violet"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Быстрый лог</Text>
            <Text style={styles.sectionTitle}>Зафиксируй активность за пару касаний</Text>
            <Text style={styles.sectionDescription}>
              Выбери тип, длительность и сразу добавь блок в дневную сводку. Все данные останутся совместимыми с будущими интеграциями.
            </Text>
          </View>

          <View style={styles.actionArea}>
            <View style={styles.chipsWrap}>
              {activityOptions.map((option) => (
                <ActivityChip
                  key={option.type}
                  label={option.label}
                  meta={option.shortMeta}
                  active={option.type === selectedType}
                  onPress={() => setSelectedType(option.type)}
                />
              ))}
            </View>

            <View style={styles.quickPanel}>
              <View style={styles.quickPanelTop}>
                <View>
                  <Text style={styles.quickPanelLabel}>Выбрано</Text>
                  <Text style={styles.quickPanelValue}>{selectedConfig.label}</Text>
                </View>
                <View style={styles.quickPanelBadge}>
                  <Text style={styles.quickPanelBadgeText}>{selectedTotal} мин уже в дне</Text>
                </View>
              </View>

              <View style={styles.durationRow}>
                {durationOptions.map((duration) => (
                  <DurationPreset
                    key={duration}
                    label={`+${duration}`}
                    active={duration === selectedDuration}
                    onPress={() => setSelectedDuration(duration)}
                  />
                ))}
              </View>

              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoRow}>
                  <Text style={styles.quickInfoLabel}>Логируем</Text>
                  <Text style={styles.quickInfoValue}>{selectedDuration} мин</Text>
                </View>
                <View style={styles.quickInfoRow}>
                  <Text style={styles.quickInfoLabel}>Оценка шагов</Text>
                  <Text style={styles.quickInfoValue}>
                    {selectedConfig.stepBoost > 0
                      ? `+${Math.round((selectedConfig.stepBoost * selectedDuration) / 20)}`
                      : "без шагов"}
                  </Text>
                </View>
                <View style={styles.quickProgressTrack}>
                  <View
                    style={[
                      styles.quickProgressFill,
                      { width: `${Math.min(100, (selectedDuration / 45) * 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <PrimaryButton
                label={`Добавить ${selectedDuration} мин`}
                onPress={addSelectedActivity}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Разбивка</Text>
            <Text style={styles.sectionTitle}>Активность дня</Text>
            <Text style={styles.sectionDescription}>
              Показываем только реальные блоки активности и сразу сортируем их по вкладу во время дня.
            </Text>
          </View>

          <View style={styles.breakdownList}>
            {breakdown.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Пока без активных блоков</Text>
                <Text style={styles.emptyStateText}>
                  Добавь первую активность сверху, и здесь появится компактная разбивка по типам движения.
                </Text>
              </View>
            ) : (
              breakdown.map((item, index) => (
                <ActivityBreakdownItem
                  key={item.type}
                  label={item.label}
                  minutes={item.minutes}
                  share={item.share}
                  highlight={index === 0}
                />
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Интеграции</Text>
            <Text style={styles.sectionTitle}>Health-провайдеры</Text>
            <Text style={styles.sectionDescription}>
              Архитектура уже готова под системные источники данных. Ниже показан текущий продуктовый статус интеграций.
            </Text>
          </View>

          <View style={[styles.integrationGrid, isWide ? styles.integrationGridWide : null]}>
            {healthAdapters.map((adapter) => (
              <IntegrationCard
                key={adapter.provider}
                title={adapter.provider === "apple_health" ? "Apple Health" : "Google Fit"}
                status={adapter.isImplemented ? "Подключено" : "Запланировано"}
                description={adapter.description}
                actionLabel={adapter.isImplemented ? "Открыть" : "Скоро"}
              />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    gap: appTheme.spacing.lg,
  },
  hero: {
    padding: appTheme.spacing.xl,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: "#11161B",
    gap: appTheme.spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: appTheme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
  },
  heroDate: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(124,140,255,0.24)",
    backgroundColor: "rgba(124,140,255,0.1)",
    gap: 2,
  },
  heroBadgeLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroBadgeValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  heroMetrics: {
    gap: appTheme.spacing.md,
  },
  heroMetricsWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroMetricBlock: {
    flex: 1,
    gap: 4,
  },
  heroMetricValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 38,
    fontWeight: "800",
  },
  heroMetricLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
  },
  heroDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: appTheme.colors.border,
  },
  heroStatus: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  statsGrid: {
    gap: appTheme.spacing.md,
  },
  statsGridWide: {
    flexDirection: "row",
  },
  section: {
    gap: appTheme.spacing.md,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionEyebrow: {
    color: appTheme.colors.accentSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  sectionDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  actionArea: {
    gap: appTheme.spacing.md,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  quickPanel: {
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  quickPanelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  quickPanelLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickPanelValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  quickPanelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  quickPanelBadgeText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  quickInfoCard: {
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.md,
    borderRadius: 20,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  quickInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  quickInfoLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
  quickInfoValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  quickProgressTrack: {
    height: 10,
    borderRadius: appTheme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  quickProgressFill: {
    height: "100%",
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.accent,
  },
  breakdownList: {
    gap: appTheme.spacing.sm,
  },
  emptyState: {
    padding: appTheme.spacing.xl,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    gap: appTheme.spacing.sm,
  },
  emptyStateTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyStateText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  integrationGrid: {
    gap: appTheme.spacing.md,
  },
  integrationGridWide: {
    flexDirection: "row",
  },
});
