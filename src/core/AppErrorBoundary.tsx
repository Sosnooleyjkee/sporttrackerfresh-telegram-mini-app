import React, { type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { APP_STORE_STORAGE_KEY } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  private resetApp = () => {
    try {
      if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
        globalThis.localStorage.removeItem(APP_STORE_STORAGE_KEY);
      }
    } catch {
      // ignore cleanup errors
    }

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Ошибка запуска</Text>
        <Text style={styles.title}>Не удалось восстановить локальные данные</Text>
        <Text style={styles.text}>
          Мы можем безопасно очистить локальный кэш приложения и перезапустить Mini App без белого экрана.
        </Text>
        <Pressable onPress={this.resetApp} style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}>
          <Text style={styles.buttonText}>Очистить кэш и перезапустить</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
    padding: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 360,
  },
  button: {
    marginTop: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: 14,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.accent,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: "#04110A",
    fontSize: 15,
    fontWeight: "800",
  },
});
