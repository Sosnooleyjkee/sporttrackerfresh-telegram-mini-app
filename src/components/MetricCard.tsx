import { StyleSheet, Text, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surfaceRaised,
    borderRadius: appTheme.radius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: appTheme.spacing.lg,
    gap: appTheme.spacing.xs,
  },
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  hint: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
});

