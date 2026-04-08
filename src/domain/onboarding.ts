import { z } from "zod";

import type { Goal, Level } from "@/domain/common";

export const onboardingSchema = z.object({
  age: z.coerce.number().min(12).max(90),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(35).max(250),
  goal: z.enum(["cut", "maintain", "muscle_gain"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  dailyStepsTarget: z.coerce.number().min(1000).max(50000),
  weeklyTrainingTarget: z.coerce.number().min(1).max(14),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export type UserQuestionnaire = OnboardingFormValues & {
  isCompleted: boolean;
};

export const defaultQuestionnaire: UserQuestionnaire = {
  age: 28,
  heightCm: 180,
  weightKg: 82,
  goal: "cut" satisfies Goal,
  level: "intermediate" satisfies Level,
  dailyStepsTarget: 10000,
  weeklyTrainingTarget: 4,
  isCompleted: false,
};

