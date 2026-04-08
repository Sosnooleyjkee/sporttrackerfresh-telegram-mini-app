import type { EntityId } from "@/domain/common";

export type ActivityType =
  | "walking"
  | "running"
  | "cycling"
  | "swimming"
  | "strength"
  | "hiit"
  | "mobility"
  | "yoga"
  | "stairs"
  | "boxing"
  | "team_sport"
  | "hiking"
  | "elliptical"
  | "other";
export type HealthProvider = "apple_health" | "google_fit";
export type HealthConnectionStatus = "disconnected" | "planned" | "connected";

export type DailyActivity = {
  id: EntityId;
  date: string;
  steps: number;
  activeMinutes: number;
  walkingMinutes: number;
  runningMinutes: number;
  cyclingMinutes: number;
  swimmingMinutes: number;
  strengthMinutes: number;
  hiitMinutes: number;
  mobilityMinutes: number;
  yogaMinutes: number;
  stairsMinutes: number;
  boxingMinutes: number;
  teamSportMinutes: number;
  hikingMinutes: number;
  ellipticalMinutes: number;
  otherMinutes: number;
};

export type HealthConnection = {
  provider: HealthProvider;
  status: HealthConnectionStatus;
  lastSyncAt: string | null;
};
