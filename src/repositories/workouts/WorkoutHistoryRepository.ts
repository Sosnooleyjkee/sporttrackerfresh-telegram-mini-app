import { getDatabase } from "@/db/sqlite";
import { createId } from "@/domain/common";
import type { PersonalRecord, WorkoutSession } from "@/domain/workout";
import { updatePersonalRecords } from "@/services/workouts/WorkoutProgressionService";

type SaveWorkoutHistoryParams = {
  session: WorkoutSession;
  history: WorkoutSession[];
  personalRecords: PersonalRecord[];
};

type SaveWorkoutHistoryResult = {
  workoutHistory: WorkoutSession[];
  personalRecords: PersonalRecord[];
};

async function persistSessionToSQLite(session: WorkoutSession) {
  const db = await getDatabase();
  if (!db) {
    return;
  }

  const statements = [
    `
    INSERT OR REPLACE INTO workout_sessions
      (id, group_name, performed_at, group_volume, previous_group_volume, progress_threshold, is_qualified)
    VALUES
      ('${session.id}', '${session.directions.join(",")}', '${session.performedAt}', ${session.blocks.reduce(
        (sum, block) => sum + block.groupVolume,
        0,
      )}, NULL, 0, 1);
    `,
    ...session.blocks.flatMap((block) =>
      block.entries.map(
        (entry) => `
      INSERT OR REPLACE INTO workout_exercises
        (id, session_id, template_id, name, weight, reps, sets, volume)
      VALUES
        ('${createId("workout_exercise")}', '${session.id}', '${entry.templateId}', '${entry.name.replace(/'/g, "''")}', ${
          entry.bestSet?.weight ?? 0
        }, ${entry.bestSet?.reps ?? 0}, ${entry.countedSets}, ${entry.volume});
    `,
      ),
    ),
  ];

  await db.execAsync(statements.join("\n"));
}

async function persistPersonalRecordsToSQLite(records: PersonalRecord[]) {
  const db = await getDatabase();
  if (!db) {
    return;
  }

  const statements = records.map(
    (record) => `
    INSERT OR REPLACE INTO personal_records
      (id, group_name, exercise_name, best_weight, reps, achieved_at)
    VALUES
      ('${record.id}', '${record.direction}', '${record.exerciseName.replace(/'/g, "''")}', ${record.bestWeight}, ${record.reps}, '${record.achievedAt}');
  `,
  );

  await db.execAsync(statements.join("\n"));
}

export const WorkoutHistoryRepository = {
  loadRecentSessions(history: WorkoutSession[], limit = 10) {
    return history.slice(0, limit);
  },

  saveSession(params: SaveWorkoutHistoryParams): SaveWorkoutHistoryResult {
    const workoutHistory = [params.session, ...params.history];
    const personalRecords = updatePersonalRecords(params.personalRecords, params.session);

    void persistSessionToSQLite(params.session);
    void persistPersonalRecordsToSQLite(personalRecords);

    return {
      workoutHistory,
      personalRecords,
    };
  },
};
