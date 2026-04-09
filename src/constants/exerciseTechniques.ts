import type { ImageSourcePropType } from "react-native";

import type { TrainingDirection } from "@/domain/workout";

export type ExerciseTechnique = {
  title: string;
  summary: string;
  cues: string[];
  sourceLabel: string;
  mediaFrames: ImageSourcePropType[];
};

const FREE_EXERCISE_DB_ROOT =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const buildFrames = (exerciseId: string): ImageSourcePropType[] => [
  { uri: `${FREE_EXERCISE_DB_ROOT}/${exerciseId}/0.jpg` },
  { uri: `${FREE_EXERCISE_DB_ROOT}/${exerciseId}/1.jpg` },
];

const templateExerciseIds: Record<string, string> = {
  chest_1: "Barbell_Bench_Press_-_Medium_Grip",
  chest_2: "Incline_Dumbbell_Press",
  chest_3: "Cable_Crossover",
  chest_4: "Dips_-_Chest_Version",
  chest_5: "Bent-Arm_Dumbbell_Pullover",
  chest_6: "Leverage_Chest_Press",
  chest_7: "Dumbbell_Bench_Press",
  chest_8: "Dumbbell_Flyes",
  chest_9: "Barbell_Incline_Bench_Press_-_Medium_Grip",
  chest_10: "Cable_Crossover",
  chest_11: "Decline_Barbell_Bench_Press",
  chest_12: "Leverage_Chest_Press",
  chest_13: "Cable_Crossover",
  chest_14: "Push-Ups",

  front_delts_1: "Dumbbell_Shoulder_Press",
  front_delts_2: "Arnold_Dumbbell_Press",
  front_delts_3: "Front_Raise_And_Pullover",
  front_delts_4: "Front_Raise_And_Pullover",
  front_delts_5: "Leverage_Shoulder_Press",
  front_delts_6: "Standing_Military_Press",
  front_delts_7: "Seated_Barbell_Military_Press",
  front_delts_8: "Front_Raise_And_Pullover",
  front_delts_9: "Front_Raise_And_Pullover",
  front_delts_10: "Barbell_Shoulder_Press",
  front_delts_11: "Standing_Military_Press",
  front_delts_12: "Front_Raise_And_Pullover",
  front_delts_13: "Front_Raise_And_Pullover",
  front_delts_14: "Dumbbell_Shoulder_Press",

  side_delts_1: "Side_Lateral_Raise",
  side_delts_2: "Cable_Seated_Lateral_Raise",
  side_delts_3: "Standing_Dumbbell_Upright_Row",
  side_delts_4: "Seated_Side_Lateral_Raise",
  side_delts_5: "Side_Lateral_Raise",
  side_delts_6: "Side_Lateral_Raise",
  side_delts_7: "One-Arm_Incline_Lateral_Raise",
  side_delts_8: "Side_Lateral_Raise",
  side_delts_9: "Cable_Seated_Lateral_Raise",
  side_delts_10: "Smith_Machine_Upright_Row",
  side_delts_11: "One-Arm_Incline_Lateral_Raise",
  side_delts_12: "Side_Lateral_Raise",
  side_delts_13: "Cable_Seated_Lateral_Raise",
  side_delts_14: "Seated_Side_Lateral_Raise",

  rear_delts_1: "Reverse_Flyes",
  rear_delts_2: "Reverse_Flyes",
  rear_delts_3: "Face_Pull",
  rear_delts_4: "Reverse_Flyes",
  rear_delts_5: "Face_Pull",
  rear_delts_6: "Reverse_Flyes",
  rear_delts_7: "Dumbbell_Lying_Rear_Lateral_Raise",
  rear_delts_8: "Face_Pull",
  rear_delts_9: "Reverse_Flyes",
  rear_delts_10: "Reverse_Flyes",
  rear_delts_11: "Face_Pull",
  rear_delts_12: "Reverse_Flyes",
  rear_delts_13: "Dumbbell_Lying_Rear_Lateral_Raise",
  rear_delts_14: "Face_Pull",

  back_1: "Wide-Grip_Lat_Pulldown",
  back_2: "Bent_Over_Barbell_Row",
  back_3: "Seated_Cable_Rows",
  back_4: "Hyperextensions_Back_Extensions",
  back_5: "One-Arm_Dumbbell_Row",
  back_6: "Pullups",
  back_7: "T-Bar_Row_with_Handle",
  back_8: "Seated_Cable_Rows",
  back_9: "Close-Grip_Front_Lat_Pulldown",
  back_10: "Bent_Over_Barbell_Row",
  back_11: "Rack_Pulls",
  back_12: "Straight-Arm_Pulldown",
  back_13: "Pendlay_Row",
  back_14: "Pullups",

  biceps_1: "Barbell_Curl",
  biceps_2: "Hammer_Curls",
  biceps_3: "EZ-Bar_Curl",
  biceps_4: "Concentration_Curls",
  biceps_5: "Preacher_Curl",
  biceps_6: "Seated_Dumbbell_Curl",
  biceps_7: "Cable_Hammer_Curls_-_Rope_Attachment",
  biceps_8: "Reverse_Barbell_Curl",
  biceps_9: "Incline_Dumbbell_Curl",
  biceps_10: "Spider_Curl",
  biceps_11: "Cable_Curls",
  biceps_12: "Hammer_Curls",
  biceps_13: "EZ-Bar_Curl",
  biceps_14: "Preacher_Curl",

  triceps_1: "EZ-Bar_Skullcrusher",
  triceps_2: "Triceps_Pushdown",
  triceps_3: "Push-Ups_-_Close_Triceps_Position",
  triceps_4: "Cable_Rope_Overhead_Triceps_Extension",
  triceps_5: "Close-Grip_Barbell_Bench_Press",
  triceps_6: "Triceps_Pushdown_-_Rope_Attachment",
  triceps_7: "Bench_Dips",
  triceps_8: "Standing_Low-Pulley_One-Arm_Triceps_Extension",
  triceps_9: "Standing_One-Arm_Dumbbell_Triceps_Extension",
  triceps_10: "JM_Press",
  triceps_11: "Lying_Close-Grip_Barbell_Triceps_Extention_Behind_The_Head",
  triceps_12: "Triceps_Pushdown_-_Rope_Attachment",
  triceps_13: "Close-Grip_Barbell_Bench_Press",
  triceps_14: "Bench_Dips",

  legs_1: "Barbell_Squat",
  legs_2: "Leg_Press",
  legs_3: "Dumbbell_Lunges",
  legs_4: "Lying_Leg_Curls",
  legs_5: "Standing_Barbell_Calf_Raise",
  legs_6: "Dumbbell_Rear_Lunge",
  legs_7: "Front_Squat_Clean_Grip",
  legs_8: "Romanian_Deadlift",
  legs_9: "Leg_Extensions",
  legs_10: "Barbell_Hip_Thrust",
  legs_11: "Bulgarian_Split_Squat",
  legs_12: "Hack_Squat",
  legs_13: "Seated_Leg_Curl",
  legs_14: "Seated_Calf_Raise",
};

const fallbackExerciseIdByDirection: Record<TrainingDirection, string> = {
  chest: "Barbell_Bench_Press_-_Medium_Grip",
  front_delts: "Dumbbell_Shoulder_Press",
  side_delts: "Side_Lateral_Raise",
  rear_delts: "Reverse_Flyes",
  back: "Wide-Grip_Lat_Pulldown",
  biceps: "Barbell_Curl",
  triceps: "Triceps_Pushdown",
  legs: "Barbell_Squat",
};

function normalize(value: string) {
  return value.toLowerCase();
}

function getMovementProfile(exerciseId: string, title: string, direction: TrainingDirection) {
  const id = normalize(exerciseId);
  const name = normalize(title);
  const haystack = `${id} ${name}`;

  if (haystack.includes("bench_press") || haystack.includes("жим") || haystack.includes("press")) {
    return {
      summary:
        "Собери корпус и веди вес по стабильной траектории без рывка, сохраняя главный акцент на целевой мышечной группе.",
      cues: [
        "Опускай вес подконтрольно 2–3 секунды и не теряй напряжение внизу.",
        "Держи запястья и локти в согласованной траектории, без развала амплитуды.",
        "Выжимай вверх силой целевой мышцы, а не инерцией корпуса.",
      ],
    };
  }

  if (haystack.includes("fly") || haystack.includes("crossover") || haystack.includes("развод") || haystack.includes("сведени")) {
    return {
      summary:
        "Сохраняй мягкий сгиб в локтях и своди руки за счет мышечного сокращения, а не за счет переноса корпуса вперед.",
      cues: [
        "Не меняй угол в локте на протяжении всего повторения.",
        "Своди руки в контролируемой точке сокращения и делай короткую паузу.",
        "Возвращайся в растяжение медленно, не бросая вес назад.",
      ],
    };
  }

  if (haystack.includes("dip") || haystack.includes("отжим")) {
    return {
      summary:
        "Держи корпус в нужном наклоне под целевую задачу и опускайся только в диапазон, где сохраняется контроль плеча.",
      cues: [
        "Не проваливайся внизу, особенно если плечо теряет стабильность.",
        "Сохраняй единый темп без пружины в нижней точке.",
        "Поднимайся за счет рабочей группы, а не рывка ногами или корпусом.",
      ],
    };
  }

  if (haystack.includes("pullover") || haystack.includes("пуловер")) {
    return {
      summary:
        "Веди вес по дуге с зафиксированным корпусом и сохрани натяжение в широчайших или грудных по всей траектории.",
      cues: [
        "Не уводи локти слишком глубоко за линию контроля плеча.",
        "Держи ребра и поясницу стабильно, без переразгибания.",
        "Возвращай вес наверх через мышечное усилие, а не инерцию.",
      ],
    };
  }

  if (haystack.includes("pulldown") || haystack.includes("lat") || haystack.includes("подтяг") || haystack.includes("pullup")) {
    return {
      summary:
        "Начинай повтор со стабилизации лопаток и тяни вниз или к себе локтями, а не кистями и бицепсом.",
      cues: [
        "Не запрокидывай корпус ради лишнего веса.",
        "Опускай плечи вниз и назад до начала основного движения.",
        "Возвращайся в растяжение плавно, сохраняя контроль широчайших.",
      ],
    };
  }

  if (haystack.includes("row") || haystack.includes("тяга")) {
    return {
      summary:
        "Тяни вес локтем вдоль контролируемой траектории и стабилизируй корпус, чтобы нагрузка не уходила в раскачку.",
      cues: [
        "Не округляй спину и не дёргай корпусом в конце повторения.",
        "Своди лопатки только в контролируемой верхней точке.",
        "Опускай вес медленнее, чем поднимаешь, сохраняя натяжение.",
      ],
    };
  }

  if (haystack.includes("curl") || haystack.includes("бицепс") || haystack.includes("молот")) {
    return {
      summary:
        "Фиксируй плечо и поднимай вес силой сгибания локтя, не помогая себе спиной или трапецией.",
      cues: [
        "Не уводи локти вперед в начале повторения.",
        "Делай короткую паузу в верхней точке для реального сокращения.",
        "Опускай вес полностью до растяжения без броска вниз.",
      ],
    };
  }

  if (
    haystack.includes("pushdown") ||
    haystack.includes("extension") ||
    haystack.includes("skullcrusher") ||
    haystack.includes("француз") ||
    haystack.includes("трицеп")
  ) {
    return {
      summary:
        "Зафиксируй плечо и разгибай руку только в рабочем диапазоне, чтобы локоть и траектория оставались стабильными.",
      cues: [
        "Не разводи локти в стороны и не меняй угол корпуса.",
        "Полностью разгибай руку только без потери контроля в локте.",
        "Подконтрольно возвращай вес назад, не бросая отрицательную фазу.",
      ],
    };
  }

  if (haystack.includes("lateral_raise") || haystack.includes("front_raise") || haystack.includes("raise") || haystack.includes("мах")) {
    return {
      summary:
        "Поднимай руки через плечевой сустав без читинга корпусом, сохраняя постоянное натяжение в целевом пучке дельты.",
      cues: [
        "Не поднимай плечи к ушам в верхней точке.",
        "Веди движение локтем, а не кистью.",
        "Сохраняй медленный негатив и не роняй вес вниз.",
      ],
    };
  }

  if (haystack.includes("face_pull") || haystack.includes("reverse_fly") || haystack.includes("rear_lateral")) {
    return {
      summary:
        "Фиксируй корпус и веди движение так, чтобы нагрузка оставалась в задней дельте и верхе спины, а не уходила в поясницу.",
      cues: [
        "Не компенсируй амплитуду отклонением корпуса назад.",
        "Сделай короткую паузу в пиковом сокращении.",
        "Возвращай вес медленно, удерживая плечо стабильным.",
      ],
    };
  }

  if (haystack.includes("squat") || haystack.includes("присед")) {
    return {
      summary:
        "Сохраняй опору через всю стопу, нейтральный корпус и контролируемую глубину без потери позиции таза и коленей.",
      cues: [
        "Не своди колени внутрь и держи их по линии носков.",
        "Опускайся подконтрольно, сохраняя давление в стопе.",
        "Поднимайся вверх без завала таза и без потери жесткости корпуса.",
      ],
    };
  }

  if (haystack.includes("leg_press") || haystack.includes("жим ног")) {
    return {
      summary:
        "Держи таз стабильно прижатым и выжимай платформу ногами без отрыва поясницы и без запирания коленей.",
      cues: [
        "Не уводи колени внутрь на усилии.",
        "Опускай платформу до глубины, где таз остается стабильным.",
        "Выжимай вверх всей стопой и без полного щелчка в колене.",
      ],
    };
  }

  if (haystack.includes("lunge") || haystack.includes("выпад")) {
    return {
      summary:
        "Держи ровный корпус и опускайся вертикально вниз, чтобы целевая нагрузка шла в ягодицы и бедро, а не в балансировку.",
      cues: [
        "Не заваливайся вперед и не теряй опору на рабочей ноге.",
        "Контролируй положение колена над стопой.",
        "Поднимайся вверх мощно, но без рывка и смещения таза.",
      ],
    };
  }

  if (haystack.includes("deadlift") || haystack.includes("romanian") || haystack.includes("румын")) {
    return {
      summary:
        "Сохраняй нейтральную спину и веди таз назад, растягивая заднюю цепь без округления и без потери контроля грифа.",
      cues: [
        "Держи штангу или гантели близко к ногам на всей траектории.",
        "Не превращай движение в присед — основа в отведении таза назад.",
        "Возвращайся вверх через ягодицы и бицепс бедра, а не через переразгибание поясницы.",
      ],
    };
  }

  if (haystack.includes("leg_curl") || haystack.includes("сгибан")) {
    return {
      summary:
        "Сгибай ногу за счет бицепса бедра, не отрывая таз и не ускоряя движение в нижней половине амплитуды.",
      cues: [
        "Не дёргай весом в стартовой фазе.",
        "Сожми заднюю поверхность бедра в верхней точке на короткую паузу.",
        "Возвращай платформу плавно и подконтрольно.",
      ],
    };
  }

  if (haystack.includes("leg_extension") || haystack.includes("разгибан")) {
    return {
      summary:
        "Разгибай колено в комфортном диапазоне, сохраняя бедро прижатым и нагрузку в квадрицепсе без раскачки корпуса.",
      cues: [
        "Не выстреливай весом в верхнюю точку.",
        "Сделай короткую паузу в сокращении квадрицепса.",
        "Опускай вес медленнее, чем поднимаешь.",
      ],
    };
  }

  if (haystack.includes("calf_raise") || haystack.includes("икр") || haystack.includes("носок")) {
    return {
      summary:
        "Проходи полную амплитуду через голеностоп и поднимайся на носок без пружины и без сокращения диапазона.",
      cues: [
        "Сделай паузу в верхней точке на сильном сокращении икры.",
        "Полностью опускай пятку в растяжение, если тренажер позволяет.",
        "Не ускоряй повтор за счет отскока внизу.",
      ],
    };
  }

  if (haystack.includes("hip_thrust") || haystack.includes("ягодич")) {
    return {
      summary:
        "Поднимай таз за счет ягодиц, сохраняя корпус собранным и без переразгибания поясницы в верхней точке.",
      cues: [
        "Не запрокидывай голову и не ломай поясницу наверху.",
        "Сделай короткую паузу в пиковом сокращении ягодиц.",
        "Опускай таз плавно и сохраняй контроль штанги.",
      ],
    };
  }

  return getFallbackProfile(direction);
}

function getFallbackProfile(direction: TrainingDirection) {
  const profiles: Record<TrainingDirection, { summary: string; cues: string[] }> = {
    chest: {
      summary: "Собери лопатки и веди движение грудью без рывка, сохраняя стабильную траекторию и контроль в негативной фазе.",
      cues: [
        "Не отпускай напряжение в нижней точке.",
        "Следи за стабильностью локтей и кистей.",
        "Выжимай или своди вес силой грудных, а не корпусом.",
      ],
    },
    front_delts: {
      summary: "Сохраняй нейтральный корпус и поднимай вес без читинга, удерживая акцент в передней дельте.",
      cues: [
        "Не переразгибай поясницу.",
        "Поднимай вес плавно и без раскачки.",
        "Контролируй негативную фазу на каждом повторе.",
      ],
    },
    side_delts: {
      summary: "Веди движение локтем и сохраняй постоянное натяжение в средней дельте, не поднимая плечи к ушам.",
      cues: [
        "Не читингуй корпусом.",
        "Поднимай и опускай вес с одинаковым контролем.",
        "Держи мягкий сгиб в локте.",
      ],
    },
    rear_delts: {
      summary: "Фиксируй корпус и тяни или разводи руки так, чтобы нагрузка оставалась в задней дельте и верхе спины.",
      cues: [
        "Не компенсируй амплитуду поясницей.",
        "Сделай короткую паузу в пиковом сокращении.",
        "Возвращайся в старт подконтрольно.",
      ],
    },
    back: {
      summary: "Начинай движение со стабилизации лопаток и не раскачивай корпус ради лишнего веса.",
      cues: [
        "Тяни локтем, а не кистью.",
        "Не округляй спину.",
        "Контролируй возврат в растяжение.",
      ],
    },
    biceps: {
      summary: "Фиксируй плечо и поднимай вес силой сгибания локтя без раскачки спиной.",
      cues: [
        "Не уводи локти вперед.",
        "Сожми бицепс в верхней точке.",
        "Опускай вес плавно до полного растяжения.",
      ],
    },
    triceps: {
      summary: "Фиксируй плечо и разгибай руку в контролируемой траектории без потери стабильности локтя.",
      cues: [
        "Не разводи локти в стороны.",
        "Работай в полном контролируемом диапазоне.",
        "Не бросай негативную фазу.",
      ],
    },
    legs: {
      summary: "Сохраняй опору в стопе и жесткий корпус на всей амплитуде, чтобы нагрузка оставалась в ногах, а не уходила в компенсации.",
      cues: [
        "Следи за траекторией коленей.",
        "Не теряй контроль в нижней точке.",
        "Поднимайся без завала корпуса.",
      ],
    },
  };

  return profiles[direction];
}

function getSourceLabel(exerciseId: string) {
  return `Каталог анимаций: Free Exercise DB • ${exerciseId}`;
}

export function getExerciseTechnique(
  templateId: string,
  title: string,
  direction: TrainingDirection,
): ExerciseTechnique {
  const exerciseId = templateExerciseIds[templateId] ?? fallbackExerciseIdByDirection[direction];
  const profile = getMovementProfile(exerciseId, title, direction);

  return {
    title,
    summary: `${title}: ${profile.summary}`,
    cues: profile.cues,
    sourceLabel: getSourceLabel(exerciseId),
    mediaFrames: buildFrames(exerciseId),
  };
}
