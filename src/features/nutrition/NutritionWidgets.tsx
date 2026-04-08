import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

type MacroCardProps = {
  label: string;
  value: string;
  secondary: string;
  progress: number;
  accent?: "amber" | "green" | "violet" | "blue";
};

export function MacroCard({ label, value, secondary, progress, accent = "amber" }: MacroCardProps) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.max(0.04, Math.min(progress, 1)),
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [animated, progress]);

  const width = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.macroCard, accentStyles[accent].card]}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroSecondary}>{secondary}</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, accentStyles[accent].fill, { width }]} />
      </View>
    </View>
  );
}

type NutritionSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function NutritionSearchBar({ value, onChangeText }: NutritionSearchBarProps) {
  return (
    <View style={styles.searchShell}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Найти продукт, блюдо или ингредиент"
        placeholderTextColor={appTheme.colors.textMuted}
        style={styles.searchInput}
      />
    </View>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.filterChip, active ? styles.filterChipActive : null, pressed ? styles.pressed : null]}>
      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

type ProductCardProps = {
  title: string;
  meta: string;
  nutrition: string;
  onAdd: () => void;
};

export function ProductCard({ title, meta, nutrition, onAdd }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCopy}>
        <Text style={styles.productTitle}>{title}</Text>
        <Text style={styles.productMeta}>{meta}</Text>
        <Text style={styles.productNutrition}>{nutrition}</Text>
      </View>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.productAddButton, pressed ? styles.pressed : null]}>
        <Text style={styles.productAddButtonText}>Добавить</Text>
      </Pressable>
    </View>
  );
}

type MealSlotChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function MealSlotChip({ label, active, onPress }: MealSlotChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.slotChip, active ? styles.slotChipActive : null, pressed ? styles.pressed : null]}>
      <Text style={[styles.slotChipText, active ? styles.slotChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

type QuickPresetProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function QuickPreset({ label, active, onPress }: QuickPresetProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.presetChip, active ? styles.presetChipActive : null, pressed ? styles.pressed : null]}>
      <Text style={[styles.presetChipText, active ? styles.presetChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

type SuggestedMealCardProps = {
  title: string;
  composition: string;
  kcal: string;
  macros: string;
  tag: string;
  onAdd: () => void;
};

export function SuggestedMealCard({ title, composition, kcal, macros, tag, onAdd }: SuggestedMealCardProps) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <View style={styles.mealTag}>
          <Text style={styles.mealTagText}>{tag}</Text>
        </View>
      </View>
      <Text style={styles.mealComposition}>{composition}</Text>
      <Text style={styles.mealNutrition}>{kcal}</Text>
      <Text style={styles.mealMacros}>{macros}</Text>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.mealButton, pressed ? styles.pressed : null]}>
        <Text style={styles.mealButtonText}>Добавить набор</Text>
      </Pressable>
    </View>
  );
}

const accentStyles = {
  amber: { card: { borderColor: "rgba(245,158,11,0.18)", backgroundColor: "#1A1610" }, fill: { backgroundColor: "rgba(245,158,11,0.9)" } },
  green: { card: { borderColor: "rgba(34,197,94,0.18)", backgroundColor: "#131A15" }, fill: { backgroundColor: "rgba(34,197,94,0.9)" } },
  violet: { card: { borderColor: "rgba(124,140,255,0.18)", backgroundColor: "#141722" }, fill: { backgroundColor: "rgba(124,140,255,0.9)" } },
  blue: { card: { borderColor: "rgba(56,189,248,0.18)", backgroundColor: "#101820" }, fill: { backgroundColor: "rgba(56,189,248,0.9)" } },
};

const styles = StyleSheet.create({
  macroCard: { flex: 1, minWidth: 0, borderRadius: 22, padding: appTheme.spacing.lg, borderWidth: 1, gap: appTheme.spacing.xs },
  macroLabel: { color: appTheme.colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  macroValue: { color: appTheme.colors.textPrimary, fontSize: 30, fontWeight: "800" },
  macroSecondary: { color: appTheme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
  progressTrack: { marginTop: 6, height: 8, borderRadius: appTheme.radius.pill, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: appTheme.radius.pill },
  searchShell: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: appTheme.spacing.md, borderRadius: 20, borderWidth: 1, borderColor: appTheme.colors.borderStrong, backgroundColor: appTheme.colors.surface },
  searchIcon: { color: appTheme.colors.textMuted, fontSize: 18 },
  searchInput: { flex: 1, color: appTheme.colors.textPrimary, fontSize: 15 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: appTheme.radius.pill, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surfaceRaised },
  filterChipActive: { borderColor: "rgba(245,158,11,0.34)", backgroundColor: "rgba(245,158,11,0.12)" },
  filterChipText: { color: appTheme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  filterChipTextActive: { color: appTheme.colors.textPrimary },
  productCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: appTheme.spacing.md, padding: appTheme.spacing.md, borderRadius: 20, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surface },
  productCopy: { flex: 1, gap: 4 },
  productTitle: { color: appTheme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
  productMeta: { color: appTheme.colors.textMuted, fontSize: 12 },
  productNutrition: { color: appTheme.colors.textSecondary, fontSize: 13, lineHeight: 18 },
  productAddButton: { minWidth: 104, paddingHorizontal: 14, paddingVertical: 12, borderRadius: appTheme.radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: appTheme.colors.surfaceRaised, borderWidth: 1, borderColor: appTheme.colors.borderStrong },
  productAddButtonText: { color: appTheme.colors.textPrimary, fontSize: 13, fontWeight: "700" },
  slotChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: appTheme.radius.pill, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surfaceRaised },
  slotChipActive: { borderColor: "rgba(34,197,94,0.32)", backgroundColor: "rgba(34,197,94,0.14)" },
  slotChipText: { color: appTheme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  slotChipTextActive: { color: appTheme.colors.textPrimary },
  presetChip: { minWidth: 78, paddingHorizontal: 14, paddingVertical: 10, borderRadius: appTheme.radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surfaceRaised },
  presetChipActive: { borderColor: "rgba(124,140,255,0.34)", backgroundColor: "rgba(124,140,255,0.14)" },
  presetChipText: { color: appTheme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  presetChipTextActive: { color: appTheme.colors.textPrimary },
  mealCard: { flex: 1, minWidth: 0, gap: appTheme.spacing.sm, padding: appTheme.spacing.lg, borderRadius: 22, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surface },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: appTheme.spacing.md },
  mealTitle: { flex: 1, color: appTheme.colors.textPrimary, fontSize: 16, fontWeight: "700" },
  mealTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: appTheme.radius.pill, backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.26)" },
  mealTagText: { color: appTheme.colors.textPrimary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  mealComposition: { color: appTheme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
  mealNutrition: { color: appTheme.colors.textPrimary, fontSize: 16, fontWeight: "700" },
  mealMacros: { color: appTheme.colors.textMuted, fontSize: 12 },
  mealButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10, borderRadius: appTheme.radius.pill, backgroundColor: appTheme.colors.surfaceRaised, borderWidth: 1, borderColor: appTheme.colors.borderStrong },
  mealButtonText: { color: appTheme.colors.textPrimary, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});
