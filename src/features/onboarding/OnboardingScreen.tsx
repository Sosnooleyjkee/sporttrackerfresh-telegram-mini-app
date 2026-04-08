import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FormNumberInput } from "@/components/forms/FormNumberInput";
import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SectionCard } from "@/components/ui/SectionCard";
import { defaultQuestionnaire, onboardingSchema, type OnboardingFormValues } from "@/domain/onboarding";
import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";

const goalOptions = [
  { value: "cut", label: "Сушка" },
  { value: "maintain", label: "Поддержание" },
  { value: "muscle_gain", label: "Набор" },
] as const;

const levelOptions = [
  { value: "beginner", label: "Новичок" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
] as const;

export function OnboardingScreen() {
  const completeQuestionnaire = useAppStore((state) => state.completeQuestionnaire);
  const { control, handleSubmit } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: defaultQuestionnaire.age,
      heightCm: defaultQuestionnaire.heightCm,
      weightKg: defaultQuestionnaire.weightKg,
      goal: defaultQuestionnaire.goal,
      level: defaultQuestionnaire.level,
      dailyStepsTarget: defaultQuestionnaire.dailyStepsTarget,
      weeklyTrainingTarget: defaultQuestionnaire.weeklyTrainingTarget,
    },
  });

  const onSubmit = handleSubmit((values) => {
    completeQuestionnaire({
      ...values,
      isCompleted: true,
    });
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Обязательная анкета</Text>
        <Text style={styles.title}>Сначала фиксируем базу пользователя</Text>
        <Text style={styles.subtitle}>
          Без анкеты приложение не откроет тренировки, активность и питание.
        </Text>
      </View>

      <SectionCard>
        <FormNumberInput control={control} name="age" label="Возраст" placeholder="Например, 28" />
        <FormNumberInput control={control} name="heightCm" label="Рост, см" placeholder="180" />
        <FormNumberInput control={control} name="weightKg" label="Вес, кг" placeholder="82" />
        <FormNumberInput control={control} name="dailyStepsTarget" label="Шаги в день" placeholder="10000" />
        <FormNumberInput control={control} name="weeklyTrainingTarget" label="Тренировок в неделю" placeholder="4" />

        <Controller
          control={control}
          name="goal"
          render={({ field: { value, onChange } }) => (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Цель</Text>
              <View style={styles.optionRow}>
                {goalOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    style={[styles.option, value === option.value ? styles.optionActive : null]}
                  >
                    <Text style={[styles.optionText, value === option.value ? styles.optionTextActive : null]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="level"
          render={({ field: { value, onChange } }) => (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Уровень</Text>
              <View style={styles.optionRow}>
                {levelOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    style={[styles.option, value === option.value ? styles.optionActive : null]}
                  >
                    <Text style={[styles.optionText, value === option.value ? styles.optionTextActive : null]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />

        <PrimaryButton label="Сохранить анкету" onPress={onSubmit} />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  group: {
    gap: appTheme.spacing.sm,
  },
  groupLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  option: {
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 12,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  optionActive: {
    borderColor: appTheme.colors.accent,
    backgroundColor: "rgba(34,197,94,0.14)",
  },
  optionText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextActive: {
    color: appTheme.colors.textPrimary,
  },
});
