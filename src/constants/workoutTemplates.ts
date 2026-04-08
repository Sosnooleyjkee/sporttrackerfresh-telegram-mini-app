import type { ExerciseTemplate, TrainingDirection } from "@/domain/workout";

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
    createTemplate("chest", 1, "Жим штанги лежа", 60, 8, 4),
    createTemplate("chest", 2, "Жим гантелей под углом", 24, 10, 4),
    createTemplate("chest", 3, "Сведение в кроссовере", 18, 12, 3),
    createTemplate("chest", 4, "Отжимания на брусьях", 0, 12, 3),
    createTemplate("chest", 5, "Пуловер с гантелью", 16, 12, 3),
    createTemplate("chest", 6, "Жим в хаммере", 45, 10, 4),
    createTemplate("chest", 7, "Жим гантелей лежа", 26, 8, 4),
    createTemplate("chest", 8, "Разводка гантелей лежа", 14, 12, 3),
    createTemplate("chest", 9, "Жим штанги под углом", 50, 8, 4),
    createTemplate("chest", 10, "Пек-дек", 45, 12, 3),
  ],
  front_delts: [
    createTemplate("front_delts", 1, "Жим гантелей сидя", 22, 8, 4),
    createTemplate("front_delts", 2, "Арнольд-жим", 18, 10, 4),
    createTemplate("front_delts", 3, "Подъем диска перед собой", 15, 12, 3),
    createTemplate("front_delts", 4, "Подъем гантелей перед собой", 10, 12, 3),
    createTemplate("front_delts", 5, "Жим в тренажере", 35, 10, 3),
    createTemplate("front_delts", 6, "Жим штанги стоя", 35, 8, 4),
    createTemplate("front_delts", 7, "Жим штанги сидя", 32, 8, 4),
    createTemplate("front_delts", 8, "Подъем блина одной рукой", 12, 12, 3),
    createTemplate("front_delts", 9, "Поочередный подъем гантелей перед собой", 8, 14, 3),
    createTemplate("front_delts", 10, "Жим в Смите сидя", 40, 10, 3),
  ],
  side_delts: [
    createTemplate("side_delts", 1, "Махи в стороны стоя", 10, 15, 4),
    createTemplate("side_delts", 2, "Махи в кроссовере", 8, 15, 3),
    createTemplate("side_delts", 3, "Тяга к подбородку", 30, 10, 3),
    createTemplate("side_delts", 4, "Махи сидя", 8, 15, 3),
    createTemplate("side_delts", 5, "Частичные махи", 12, 20, 2),
    createTemplate("side_delts", 6, "Махи в тренажере", 35, 15, 3),
    createTemplate("side_delts", 7, "Наклонные махи в сторону", 7, 15, 3),
    createTemplate("side_delts", 8, "Махи с паузой наверху", 8, 12, 3),
    createTemplate("side_delts", 9, "Подъемы одной рукой в кроссовере", 7, 15, 3),
    createTemplate("side_delts", 10, "Широкая тяга в Смите", 25, 10, 3),
  ],
  rear_delts: [
    createTemplate("rear_delts", 1, "Разведения в наклоне", 8, 15, 4),
    createTemplate("rear_delts", 2, "Обратная бабочка", 30, 12, 4),
    createTemplate("rear_delts", 3, "Тяга каната к лицу", 22, 15, 3),
    createTemplate("rear_delts", 4, "Тяга гантелей в наклоне", 12, 12, 3),
    createTemplate("rear_delts", 5, "Face pull с паузой", 18, 15, 3),
    createTemplate("rear_delts", 6, "Обратные махи в кроссовере", 8, 15, 3),
    createTemplate("rear_delts", 7, "Разведения лежа на наклонной скамье", 7, 15, 3),
    createTemplate("rear_delts", 8, "Широкая тяга каната к лицу", 20, 15, 3),
    createTemplate("rear_delts", 9, "Тяга штанги к груди широким хватом", 30, 10, 3),
    createTemplate("rear_delts", 10, "Махи в тренажере задней дельты", 30, 15, 3),
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
  ],
  biceps: [
    createTemplate("biceps", 1, "Подъем штанги на бицепс", 30, 10, 4),
    createTemplate("biceps", 2, "Молотки", 14, 12, 3),
    createTemplate("biceps", 3, "Подъем EZ-грифа", 28, 10, 3),
    createTemplate("biceps", 4, "Концентрированный подъем", 10, 12, 3),
    createTemplate("biceps", 5, "Подъем на скамье Скотта", 22, 10, 3),
    createTemplate("biceps", 6, "Подъем гантелей сидя", 12, 12, 3),
    createTemplate("biceps", 7, "Подъем каната на нижнем блоке", 18, 12, 3),
    createTemplate("biceps", 8, "Подъем штанги обратным хватом", 22, 12, 3),
    createTemplate("biceps", 9, "Подъем на наклонной скамье", 10, 12, 3),
    createTemplate("biceps", 10, "Spider curl", 10, 12, 3),
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
  ],
  legs: [
    createTemplate("legs", 1, "Приседания со штангой", 80, 6, 4),
    createTemplate("legs", 2, "Жим ногами", 140, 10, 4),
    createTemplate("legs", 3, "Выпады с гантелями", 18, 12, 3),
    createTemplate("legs", 4, "Сгибание ног лежа", 35, 12, 3),
    createTemplate("legs", 5, "Подъем на носки", 50, 15, 4),
    createTemplate("legs", 6, "Болгарские сплит-приседы", 16, 10, 3),
    createTemplate("legs", 7, "Фронтальный присед", 60, 6, 4),
    createTemplate("legs", 8, "Румынская тяга", 70, 8, 4),
    createTemplate("legs", 9, "Разгибание ног сидя", 45, 12, 3),
    createTemplate("legs", 10, "Ягодичный мост", 80, 10, 4),
  ],
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

export function getAlternativeTemplates(direction: TrainingDirection, activeTemplateId: string) {
  return workoutTemplates[direction].filter((item) => item.id !== activeTemplateId);
}
