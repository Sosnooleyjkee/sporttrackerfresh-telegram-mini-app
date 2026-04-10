import { NavigationContainer, DarkTheme } from "@react-navigation/native";

import { AppBootstrap } from "@/core/AppBootstrap";
import { AppErrorBoundary } from "@/core/AppErrorBoundary";
import { RootNavigator } from "@/navigation/RootNavigator";
import { appTheme } from "@/theme/appTheme";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: appTheme.colors.background,
    card: appTheme.colors.surface,
    border: appTheme.colors.border,
    primary: appTheme.colors.accent,
    text: appTheme.colors.textPrimary,
    notification: appTheme.colors.accent,
  },
};

export function AppRoot() {
  return (
    <AppErrorBoundary>
      <AppBootstrap>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppBootstrap>
    </AppErrorBoundary>
  );
}
