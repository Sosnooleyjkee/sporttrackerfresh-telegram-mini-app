import { Platform } from "react-native";

import { buildSeedStatements } from "@/db/migrations";
import { schemaSql } from "@/db/schema";

type DatabaseLike = {
  execAsync: (sql: string) => Promise<void>;
};

let dbPromise: Promise<DatabaseLike | null> | null = null;

export async function getDatabase(): Promise<DatabaseLike | null> {
  if (Platform.OS === "web") {
    return null;
  }

  if (!dbPromise) {
    dbPromise = import("expo-sqlite").then((SQLite) =>
      SQLite.openDatabaseAsync("sport_tracker_fresh.db"),
    );
  }

  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  if (!db) {
    return null;
  }

  await db.execAsync(schemaSql);
  await db.execAsync(buildSeedStatements());

  return db;
}
