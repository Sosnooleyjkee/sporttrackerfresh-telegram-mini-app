import type { ExerciseTemplate, TrainingDirection } from "@/domain/workout";

type MovementIntent =
  | "horizontal_press"
  | "incline_press"
  | "fly"
  | "dip"
  | "pullover"
  | "vertical_press"
  | "front_raise"
  | "lateral_raise"
  | "upright_row"
  | "rear_delt"
  | "face_pull"
  | "vertical_pull"
  | "horizontal_row"
  | "lower_back"
  | "biceps_curl"
  | "hammer_curl"
  | "triceps_extension"
  | "triceps_press"
  | "squat"
  | "leg_press"
  | "lunge"
  | "hinge"
  | "leg_curl"
  | "leg_extension"
  | "calf_raise"
  | "hip_thrust";

const createTemplate = (
  direction: TrainingDirection,
  order: number,
  name: string,
  defaultWeight: number,
  defaultReps: number,
  defaultSets: number,
): ExerciseTemplate => ({
  id: `${direction}_${order}`,
  direction,
  order,
  name,
  defaultWeight,
  defaultReps,
  defaultSets,
});

export const trainingDirectionLabels: Record<TrainingDirection, string> = {
  chest: "Грудь",
  front_delts: "Передняя дельта",
  side_delts: "Средняя дельта",
  rear_delts: "Задняя дельта",
  back: "Спина",
  biceps: "Бицепс",
  triceps: "Трицепс",
  legs: "Ноги",
};

export const workoutTemplates: Record<TrainingDirection, ExerciseTemplate[]> = {
  chest: [
    createTemplate("chest", 1, "Жим штанги лёжа", 60, 8, 4),
    createTemplate("chest", 2, "Жим гантелей под углом", 24, 10, 4),
    createTemplate("chest", 3, "Сведение в кроссовере", 18, 12, 3),
    createTemplate("chest", 4, "Отжимания на брусьях", 0, 12, 3),
    createTemplate("chest", 5, "Пуловер с гантелью", 16, 12, 3),
    createTemplate("chest", 6, "Жим в хаммере", 45, 10, 4),
    createTemplate("chest", 7, "Жим гантелей лёжа", 26, 8, 4),
    createTemplate("chest", 8, "Разводка гантелей лёжа", 14, 12, 3),
    createTemplate("chest", 9, "Жим штанги под углом", 50, 8, 4),
    createTemplate("chest", 10, "Пек-дек", 45, 12, 3),
    createTemplate("chest", 11, "Жим в Смите под углом", 52, 8, 4),
    createTemplate("chest", 12, "Жим в тренажёре сидя", 50, 10, 4),
    createTemplate("chest", 13, "Кроссовер снизу вверх", 16, 12, 3),
    createTemplate("chest", 14, "Отжимания с весом", 10, 10, 3),
  ],
  front_delts: [
    createTemplate("front_delts", 1, "Жим гантелей сидя", 22, 8, 4),
    createTemplate("front_delts", 2, "Арнольд-жим", 18, 10, 4),
    createTemplate("front_delts", 3, "Подъём диска перед собой", 15, 12, 3),
    createTemplate("front_delts", 4, "Подъём гантелей перед собой", 10, 12, 3),
    createTemplate("front_delts", 5, "Жим в тренажёре", 35, 10, 3),
    createTemplate("front_delts", 6, "Жим штанги стоя", 35, 8, 4),
    createTemplate("front_delts", 7, "Жим штанги сидя", 32, 8, 4),
    createTemplate("front_delts", 8, "Подъём блина одной рукой", 12, 12, 3),
    createTemplate("front_delts", 9, "Поочерёдный подъём гантелей перед собой", 8, 14, 3),
    createTemplate("front_delts", 10, "Жим в Смите сидя", 40, 10, 3),
    createTemplate("front_delts", 11, "Жим в хаммере над головой", 38, 10, 3),
    createTemplate("front_delts", 12, "Фронтальный подъём на блоке", 8, 15, 3),
    createTemplate("front_delts", 13, "Жим гири одной рукой", 18, 8, 3),
    createTemplate("front_delts", 14, "Landmine-жим", 25, 10, 3),
  ],
  side_delts: [
    createTemplate("side_delts", 1, "Махи в стороны стоя", 10, 15, 4),
    createTemplate("side_delts", 2, "Махи в кроссовере", 8, 15, 3),
    createTemplate("side_delts", 3, "Тяга к подбородку", 30, 10, 3),
    createTemplate("side_delts", 4, "Махи сидя", 8, 15, 3),
    createTemplate("side_delts", 5, "Частичные махи", 12, 20, 2),
    createTemplate("side_delts", 6, "Махи в тренажёре", 35, 15, 3),
    createTemplate("side_delts", 7, "Наклонные махи в сторону", 7, 15, 3),
    createTemplate("side_delts", 8, "Махи с паузой наверху", 8, 12, 3),
    createTemplate("side_delts", 9, "Подъёмы одной рукой в кроссовере", 7, 15, 3),
    createTemplate("side_delts", 10, "Широкая тяга в Смите", 25, 10, 3),
    createTemplate("side_delts", 11, "Y-raise на наклонной скамье", 6, 15, 3),
    createTemplate("side_delts", 12, "Lean-away махи", 7, 15, 3),
    createTemplate("side_delts", 13, "Махи в нижнем блоке за спиной", 7, 15, 3),
    createTemplate("side_delts", 14, "Тяга каната к подбородку", 20, 12, 3),
  ],
  rear_delts: [
    createTemplate("rear_delts", 1, "Разведения в наклоне", 8, 15, 4),
    createTemplate("rear_delts", 2, "Обратная бабочка", 30, 12, 4),
    createTemplate("rear_delts", 3, "Тяга каната к лицу", 22, 15, 3),
    createTemplate("rear_delts", 4, "Тяга гантелей в наклоне", 12, 12, 3),
    createTemplate("rear_delts", 5, "Face pull с паузой", 18, 15, 3),
    createTemplate("rear_delts", 6, "Обратные махи в кроссовере", 8, 15, 3),
    createTemplate("rear_delts", 7, "Разведения лёжа на наклонной скамье", 7, 15, 3),
    createTemplate("rear_delts", 8, "Широкая тяга каната к лицу", 20, 15, 3),
    createTemplate("rear_delts", 9, "Тяга штанги к груди широким хватом", 30, 10, 3),
    createTemplate("rear_delts", 10, "Махи в тренажёре задней дельты", 30, 15, 3),
    createTemplate("rear_delts", 11, "Reverse pec-deck одной рукой", 18, 15, 3),
    createTemplate("rear_delts", 12, "Face pull из нижнего блока", 16, 15, 3),
    createTemplate("rear_delts", 13, "Разведения в кроссовере лёжа грудью", 7, 15, 3),
    createTemplate("rear_delts", 14, "Тяга к лицу с внешней ротацией", 14, 15, 3),
  ],
  back: [
    createTemplate("back", 1, "Тяга верхнего блока", 55, 10, 4),
    createTemplate("back", 2, "Тяга штанги в наклоне", 60, 8, 4),
    createTemplate("back", 3, "Гребля сидя", 50, 12, 3),
    createTemplate("back", 4, "Гиперэкстензия", 0, 15, 3),
    createTemplate("back", 5, "Тяга гантели одной рукой", 28, 10, 3),
    createTemplate("back", 6, "Подтягивания широким хватом", 0, 8, 4),
    createTemplate("back", 7, "Тяга Т-грифа", 50, 10, 4),
    createTemplate("back", 8, "Тяга узкого блока", 48, 12, 3),
    createTemplate("back", 9, "Пулдаун обратным хватом", 45, 10, 3),
    createTemplate("back", 10, "Тяга штанги Пендли", 55, 8, 3),
    createTemplate("back", 11, "Тяга в хаммере к поясу", 45, 10, 4),
    createTemplate("back", 12, "Тяга chest-supported row", 36, 10, 4),
    createTemplate("back", 13, "Подтягивания нейтральным хватом", 0, 8, 4),
    createTemplate("back", 14, "Пуловер на верхнем блоке", 22, 12, 3),
  ],
  biceps: [
    createTemplate("biceps", 1, "Подъём штанги на бицепс", 30, 10, 4),
    createTemplate("biceps", 2, "Молотки", 14, 12, 3),
    createTemplate("biceps", 3, "Подъём EZ-грифа", 28, 10, 3),
    createTemplate("biceps", 4, "Концентрированный подъём", 10, 12, 3),
    createTemplate("biceps", 5, "Подъём на скамье Скотта", 22, 10, 3),
    createTemplate("biceps", 6, "Подъём гантелей сидя", 12, 12, 3),
    createTemplate("biceps", 7, "Подъём каната на нижнем блоке", 18, 12, 3),
    createTemplate("biceps", 8, "Подъём штанги обратным хватом", 22, 12, 3),
    createTemplate("biceps", 9, "Подъём на наклонной скамье", 10, 12, 3),
    createTemplate("biceps", 10, "Spider curl", 10, 12, 3),
    createTemplate("biceps", 11, "Bayesian curl", 9, 15, 3),
    createTemplate("biceps", 12, "Cross-body hammer curl", 12, 12, 3),
    createTemplate("biceps", 13, "Подъём на блоке одной рукой", 10, 14, 3),
    createTemplate("biceps", 14, "Подъём на машине Скотта", 20, 10, 3),
  ],
  triceps: [
    createTemplate("triceps", 1, "Французский жим", 24, 10, 4),
    createTemplate("triceps", 2, "Разгибание на блоке", 25, 12, 3),
    createTemplate("triceps", 3, "Отжимания узким хватом", 0, 15, 3),
    createTemplate("triceps", 4, "Разгибание из-за головы", 12, 12, 3),
    createTemplate("triceps", 5, "Жим узким хватом", 50, 8, 4),
    createTemplate("triceps", 6, "Разгибание каната на блоке", 24, 12, 3),
    createTemplate("triceps", 7, "Обратные отжимания от скамьи", 0, 15, 3),
    createTemplate("triceps", 8, "Разгибание одной рукой на блоке", 12, 12, 3),
    createTemplate("triceps", 9, "Французский жим сидя одной гантелью", 18, 10, 3),
    createTemplate("triceps", 10, "JM press", 35, 8, 3),
    createTemplate("triceps", 11, "Kickback с гантелью", 8, 15, 3),
    createTemplate("triceps", 12, "Разгибание в кроссовере обратным хватом", 14, 12, 3),
    createTemplate("triceps", 13, "Жим в тренажёре узким хватом", 40, 10, 3),
    createTemplate("triceps", 14, "Канат из-за головы стоя", 18, 12, 3),
  ],
  legs: [
    createTemplate("legs", 1, "Приседания со штангой", 80, 6, 4),
    createTemplate("legs", 2, "Жим ногами", 140, 10, 4),
    createTemplate("legs", 3, "Выпады с гантелями", 18, 12, 3),
    createTemplate("legs", 4, "Сгибание ног лёжа", 35, 12, 3),
    createTemplate("legs", 5, "Подъём на носки", 50, 15, 4),
    createTemplate("legs", 6, "Болгарские сплит-приседы", 16, 10, 3),
    createTemplate("legs", 7, "Фронтальный присед", 60, 6, 4),
    createTemplate("legs", 8, "Румынская тяга", 70, 8, 4),
    createTemplate("legs", 9, "Разгибание ног сидя", 45, 12, 3),
    createTemplate("legs", 10, "Ягодичный мост", 80, 10, 4),
    createTemplate("legs", 11, "Hack-присед", 90, 10, 4),
    createTemplate("legs", 12, "Сумо-присед с гантелью", 28, 12, 3),
    createTemplate("legs", 13, "Шагающие выпады", 16, 12, 3),
    createTemplate("legs", 14, "Сидячее сгибание ног", 34, 12, 3),
  ],
};

const movementIntentByTemplateId: Record<string, MovementIntent> = {
  chest_1: "horizontal_press",
  chest_2: "incline_press",
  chest_3: "fly",
  chest_4: "dip",
  chest_5: "pullover",
  chest_6: "horizontal_press",
  chest_7: "horizontal_press",
  chest_8: "fly",
  chest_9: "incline_press",
  chest_10: "fly",
  chest_11: "incline_press",
  chest_12: "horizontal_press",
  chest_13: "fly",
  chest_14: "dip",

  front_delts_1: "vertical_press",
  front_delts_2: "vertical_press",
  front_delts_3: "front_raise",
  front_delts_4: "front_raise",
  front_delts_5: "vertical_press",
  front_delts_6: "vertical_press",
  front_delts_7: "vertical_press",
  front_delts_8: "front_raise",
  front_delts_9: "front_raise",
  front_delts_10: "vertical_press",
  front_delts_11: "vertical_press",
  front_delts_12: "front_raise",
  front_delts_13: "vertical_press",
  front_delts_14: "vertical_press",

  side_delts_1: "lateral_raise",
  side_delts_2: "lateral_raise",
  side_delts_3: "upright_row",
  side_delts_4: "lateral_raise",
  side_delts_5: "lateral_raise",
  side_delts_6: "lateral_raise",
  side_delts_7: "lateral_raise",
  side_delts_8: "lateral_raise",
  side_delts_9: "lateral_raise",
  side_delts_10: "upright_row",
  side_delts_11: "lateral_raise",
  side_delts_12: "lateral_raise",
  side_delts_13: "lateral_raise",
  side_delts_14: "upright_row",

  rear_delts_1: "rear_delt",
  rear_delts_2: "rear_delt",
  rear_delts_3: "face_pull",
  rear_delts_4: "rear_delt",
  rear_delts_5: "face_pull",
  rear_delts_6: "rear_delt",
  rear_delts_7: "rear_delt",
  rear_delts_8: "face_pull",
  rear_delts_9: "rear_delt",
  rear_delts_10: "rear_delt",
  rear_delts_11: "rear_delt",
  rear_delts_12: "face_pull",
  rear_delts_13: "rear_delt",
  rear_delts_14: "face_pull",

  back_1: "vertical_pull",
  back_2: "horizontal_row",
  back_3: "horizontal_row",
  back_4: "lower_back",
  back_5: "horizontal_row",
  back_6: "vertical_pull",
  back_7: "horizontal_row",
  back_8: "horizontal_row",
  back_9: "vertical_pull",
  back_10: "horizontal_row",
  back_11: "horizontal_row",
  back_12: "horizontal_row",
  back_13: "vertical_pull",
  back_14: "vertical_pull",

  biceps_1: "biceps_curl",
  biceps_2: "hammer_curl",
  biceps_3: "biceps_curl",
  biceps_4: "biceps_curl",
  biceps_5: "biceps_curl",
  biceps_6: "biceps_curl",
  biceps_7: "hammer_curl",
  biceps_8: "biceps_curl",
  biceps_9: "biceps_curl",
  biceps_10: "biceps_curl",
  biceps_11: "biceps_curl",
  biceps_12: "hammer_curl",
  biceps_13: "biceps_curl",
  biceps_14: "biceps_curl",

  triceps_1: "triceps_extension",
  triceps_2: "triceps_extension",
  triceps_3: "triceps_press",
  triceps_4: "triceps_extension",
  triceps_5: "triceps_press",
  triceps_6: "triceps_extension",
  triceps_7: "triceps_press",
  triceps_8: "triceps_extension",
  triceps_9: "triceps_extension",
  triceps_10: "triceps_press",
  triceps_11: "triceps_extension",
  triceps_12: "triceps_extension",
  triceps_13: "triceps_press",
  triceps_14: "triceps_extension",

  legs_1: "squat",
  legs_2: "leg_press",
  legs_3: "lunge",
  legs_4: "leg_curl",
  legs_5: "calf_raise",
  legs_6: "lunge",
  legs_7: "squat",
  legs_8: "hinge",
  legs_9: "leg_extension",
  legs_10: "hip_thrust",
  legs_11: "squat",
  legs_12: "squat",
  legs_13: "lunge",
  legs_14: "leg_curl",
};

const defaultTemplateIdsByDirection: Record<TrainingDirection, string[]> = {
  chest: ["chest_1", "chest_2", "chest_3", "chest_4", "chest_5"],
  front_delts: ["front_delts_1", "front_delts_2", "front_delts_3", "front_delts_4", "front_delts_5"],
  side_delts: ["side_delts_1", "side_delts_2", "side_delts_3", "side_delts_4", "side_delts_5"],
  rear_delts: ["rear_delts_1", "rear_delts_2", "rear_delts_3", "rear_delts_4", "rear_delts_5"],
  back: ["back_1", "back_2", "back_3", "back_4", "back_5"],
  biceps: ["biceps_1", "biceps_2", "biceps_3", "biceps_4", "biceps_5"],
  triceps: ["triceps_1", "triceps_2", "triceps_3", "triceps_4", "triceps_5"],
  legs: ["legs_1", "legs_2", "legs_3", "legs_4", "legs_5"],
};

export function getDefaultTemplatesForDirection(direction: TrainingDirection) {
  const ids = new Set(defaultTemplateIdsByDirection[direction]);
  return workoutTemplates[direction].filter((item) => ids.has(item.id));
}

export function getExerciseTemplateById(templateId: string) {
  return Object.values(workoutTemplates)
    .flat()
    .find((item) => item.id === templateId);
}

export function getTemplateMovementIntent(templateId: string) {
  return movementIntentByTemplateId[templateId] ?? null;
}

export function getAlternativeTemplates(
  direction: TrainingDirection,
  activeTemplateId: string,
  excludedTemplateIds: string[] = [],
) {
  const activeIntent = getTemplateMovementIntent(activeTemplateId);
  const blockedIds = new Set([activeTemplateId, ...excludedTemplateIds]);
  const candidates = workoutTemplates[direction].filter((item) => !blockedIds.has(item.id));

  return candidates.sort((left, right) => {
    const leftMatchesIntent = getTemplateMovementIntent(left.id) === activeIntent ? 1 : 0;
    const rightMatchesIntent = getTemplateMovementIntent(right.id) === activeIntent ? 1 : 0;

    if (leftMatchesIntent !== rightMatchesIntent) {
      return rightMatchesIntent - leftMatchesIntent;
    }

    return left.order - right.order;
  });
}
