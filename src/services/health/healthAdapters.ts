import type { HealthConnection } from "@/domain/activity";

export type HealthAdapter = {
  provider: HealthConnection["provider"];
  isImplemented: boolean;
  description: string;
};

export const healthAdapters: HealthAdapter[] = [
  {
    provider: "apple_health",
    isImplemented: false,
    description: "Подготовлен контракт для будущей интеграции с Apple Health.",
  },
  {
    provider: "google_fit",
    isImplemented: false,
    description: "Подготовлен контракт для будущей интеграции с Google Fit.",
  },
];

