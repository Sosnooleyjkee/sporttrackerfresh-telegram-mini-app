import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

type ActivityStatCardProps = {
  label: string;
  value: string;
  note: string;
  accent?: "green" | "violet";
};

export function ActivityStatCard({
  label,
  value,
  note,
  accent = "green",
}: ActivityStatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        accent === "green" ? styles.statCardGreen : styles.statCardViolet,
      ]}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

type ActivityChipProps = {
  label: string;
  meta: string;
  active: boolean;
  onPress: () => void;
};

export function ActivityChip({
  label,
  meta,
  active,
  onPress,
}: ActivityChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.activityChip,
        active ? styles.activityChipActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.activityChipLabel, active ? styles.activityChipLabelActive : null]}>
        {label}
      </Text>
      <Text style={[styles.activityChipMeta, active ? styles.activityChipMetaActive : null]}>
        {meta}
      </Text>
    </Pressable>
  );
}

type DurationPresetProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function DurationPreset({
  label,
  active,
  onPress,
}: DurationPresetProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.durationChip,
        active ? styles.durationChipActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.durationChipText, active ? styles.durationChipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

type ActivityBreakdownItemProps = {
  label: string;
  minutes: number;
  share: number;
  highlight?: boolean;
};

export function ActivityBreakdownItem({
  label,
  minutes,
  share,
  highlight = false,
}: ActivityBreakdownItemProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.max(share, 0.04),
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [progress, share]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.breakdownItem, highlight ? styles.breakdownItemHighlight : null]}>
      <View style={styles.breakdownHeader}>
        <View style={styles.breakdownTitleRow}>
          <Text style={styles.breakdownLabel}>{label}</Text>
          {highlight ? <Text style={styles.topBadge}>Top</Text> : null}
        </View>
        <Text style={styles.breakdownMinutes}>{minutes} мин</Text>
      </View>
      <View style={styles.breakdownMetaRow}>
        <Text style={styles.breakdownShare}>{Math.round(share * 100)}% от активного времени</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            highlight ? styles.progressFillHighlight : null,
            { width },
          ]}
        />
      </View>
    </View>
  );
}

type IntegrationCardProps = {
  title: string;
  status: string;
  description: string;
  actionLabel: string;
};

export function IntegrationCard({
  title,
  status,
  description,
  actionLabel,
}: IntegrationCardProps) {
  return (
    <View style={styles.integrationCard}>
      <View style={styles.integrationHeader}>
        <Text style={styles.integrationTitle}>{title}</Text>
        <View style={styles.integrationStatus}>
          <Text style={styles.integrationStatusText}>{status}</Text>
        </View>
      </View>
      <Text style={styles.integrationDescription}>{description}</Text>
      <Pressable style={({ pressed }) => [styles.integrationAction, pressed ? styles.pressed : null]}>
        <Text style={styles.integrationActionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 24,
    padding: appTheme.spacing.lg,
    borderWidth: 1,
    gap: appTheme.spacing.xs,
    backgroundColor: appTheme.colors.surface,
  },
  statCardGreen: {
    borderColor: "rgba(34,197,94,0.18)",
    backgroundColor: "#121A15",
  },
  statCardViolet: {
    borderColor: "rgba(124,140,255,0.18)",
    backgroundColor: "#141722",
  },
  statLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },
  statNote: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  activityChip: {
    minWidth: 116,
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceRaised,
    gap: 4,
  },
  activityChipActive: {
    borderColor: "rgba(34,197,94,0.36)",
    backgroundColor: "#16231A",
    shadowColor: "#22C55E",
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  activityChipLabel: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  activityChipLabelActive: {
    color: "#E9FFF1",
  },
  activityChipMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  activityChipMetaActive: {
    color: "#A7DDB8",
  },
  durationChip: {
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: appTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceRaised,
  },
  durationChipActive: {
    borderColor: "rgba(124,140,255,0.4)",
    backgroundColor: "rgba(124,140,255,0.16)",
  },
  durationChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  durationChipTextActive: {
    color: appTheme.colors.textPrimary,
  },
  breakdownItem: {
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.md,
    borderRadius: 20,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  breakdownItemHighlight: {
    borderColor: "rgba(34,197,94,0.2)",
    backgroundColor: "#131C17",
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  breakdownTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  breakdownLabel: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  topBadge: {
    color: appTheme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  breakdownMinutes: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownShare: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: appTheme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: appTheme.radius.pill,
    backgroundColor: "rgba(124,140,255,0.72)",
  },
  progressFillHighlight: {
    backgroundColor: "rgba(34,197,94,0.85)",
  },
  integrationCard: {
    flex: 1,
    minWidth: 0,
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  integrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  integrationTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  integrationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: appTheme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(124,140,255,0.28)",
    backgroundColor: "rgba(124,140,255,0.12)",
  },
  integrationStatusText: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  integrationDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  integrationAction: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  integrationActionText: {
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
