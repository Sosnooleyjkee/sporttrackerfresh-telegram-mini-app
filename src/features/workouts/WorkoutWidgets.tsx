import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

type SummaryStatProps = {
  label: string;
  value: string;
  accent?: "neutral" | "green" | "violet";
};

export function SummaryStat({
  label,
  value,
  accent = "neutral",
}: SummaryStatProps) {
  return (
    <View
      style={[
        styles.summaryStat,
        accent === "green" ? styles.summaryStatGreen : null,
        accent === "violet" ? styles.summaryStatViolet : null,
      ]}
    >
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
    </View>
  );
}

type CompactInputCardProps = {
  label: string;
  hint: string;
  children: ReactNode;
};

export function CompactInputCard({
  label,
  hint,
  children,
}: CompactInputCardProps) {
  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputCardLabel}>{label}</Text>
      {children}
      <Text style={styles.inputCardHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryStat: {
    flex: 1,
    minWidth: 0,
    borderRadius: 22,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    gap: 6,
  },
  summaryStatGreen: {
    borderColor: "rgba(34,197,94,0.18)",
    backgroundColor: "#131A15",
  },
  summaryStatViolet: {
    borderColor: "rgba(124,140,255,0.18)",
    backgroundColor: "#141722",
  },
  summaryStatLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryStatValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  inputCard: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceRaised,
  },
  inputCardLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputCardHint: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
  },
});
