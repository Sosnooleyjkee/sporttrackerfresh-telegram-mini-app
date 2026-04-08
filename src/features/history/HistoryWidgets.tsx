import { Pressable, StyleSheet, Text, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

export function HistoryHeroStat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatNote}>{note}</Text>
    </View>
  );
}

export function SessionStatusPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active ? styles.pillActive : null]}>
      <Text style={[styles.pillText, active ? styles.pillTextActive : null]}>{label}</Text>
    </View>
  );
}

export function SurfaceSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function MetricPanel({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: "green" | "violet" | "amber";
}) {
  return (
    <View style={styles.metricPanel}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          accent === "green" ? styles.metricValueGreen : null,
          accent === "violet" ? styles.metricValueViolet : null,
          accent === "amber" ? styles.metricValueAmber : null,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.metricNote}>{note}</Text>
    </View>
  );
}

export function TimelineBar({ points }: { points: number[] }) {
  const maxValue = Math.max(...points, 1);

  return (
    <View style={styles.timelineBar}>
      {points.map((point, index) => (
        <View key={`${index}_${point}`} style={styles.timelineColumn}>
          <View style={[styles.timelineFill, { height: `${Math.max(10, (point / maxValue) * 100)}%` }]} />
        </View>
      ))}
    </View>
  );
}

export function InsightCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightNote}>{note}</Text>
    </View>
  );
}

export function DataRow({
  title,
  subtitle,
  trailing,
  children,
  onPress,
}: {
  title: string;
  subtitle: string;
  trailing?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.dataRow}>
      <View style={styles.dataRowCopy}>
        <Text style={styles.dataRowTitle}>{title}</Text>
        <Text style={styles.dataRowSubtitle}>{subtitle}</Text>
        {children}
      </View>
      {trailing ? <Text style={styles.dataRowTrailing}>{trailing}</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.pressed : null]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  heroStat: {
    flex: 1,
    minWidth: 120,
    gap: 4,
  },
  heroStatLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroStatValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
  },
  heroStatNote: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: appTheme.radius.pill,
    backgroundColor: "#101419",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  pillActive: {
    backgroundColor: "#16211A",
    borderColor: "rgba(34,197,94,0.18)",
  },
  pillText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  pillTextActive: {
    color: appTheme.colors.textPrimary,
  },
  metricPanel: {
    flex: 1,
    minWidth: 150,
    gap: 6,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  metricLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  metricValueGreen: {
    color: appTheme.colors.accent,
  },
  metricValueViolet: {
    color: appTheme.colors.accentSoft,
  },
  metricValueAmber: {
    color: appTheme.colors.warning,
  },
  metricNote: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  timelineBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 112,
    paddingTop: 12,
  },
  timelineColumn: {
    flex: 1,
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  timelineFill: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: appTheme.colors.accentSoft,
    minHeight: 10,
  },
  insightCard: {
    flex: 1,
    minWidth: 160,
    gap: 6,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: "#11161B",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  insightTitle: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  insightValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  insightNote: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
    borderRadius: 22,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  dataRowCopy: {
    flex: 1,
    gap: 4,
  },
  dataRowTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  dataRowSubtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  dataRowTrailing: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.86,
  },
});
