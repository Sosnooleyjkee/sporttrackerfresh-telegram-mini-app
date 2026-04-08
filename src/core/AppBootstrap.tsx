import { type PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { initializeDatabase } from "@/db/sqlite";
import { initializeTelegramMiniApp } from "@/services/telegram/TelegramMiniAppService";
import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";

export function AppBootstrap({ children }: PropsWithChildren) {
  const finishBootstrap = useAppStore((state) => state.finishBootstrap);
  const isBootstrapped = useAppStore((state) => state.isBootstrapped);
  const setTelegramSession = useAppStore((state) => state.setTelegramSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let destroyTelegram = () => {};

    async function bootstrap() {
      try {
        const [_, telegramController] = await Promise.all([initializeDatabase(), initializeTelegramMiniApp()]);

        destroyTelegram = telegramController.destroy;

        if (isMounted) {
          setTelegramSession(telegramController.getSession());
          const unsubscribeTelegram = telegramController.subscribe((session) => {
            setTelegramSession(session);
          });

          destroyTelegram = () => {
            unsubscribeTelegram();
            telegramController.destroy();
          };

          finishBootstrap();
        }
      } catch {
        if (isMounted) {
          setError("Не удалось инициализировать локальные сервисы приложения.");
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
      destroyTelegram();
    };
  }, [finishBootstrap, setTelegramSession]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Ошибка запуска</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  if (!isBootstrapped) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={appTheme.colors.accent} />
        <Text style={styles.text}>Подготавливаем локальное хранилище, Telegram WebView и seed-данные...</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
    padding: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  text: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
});
