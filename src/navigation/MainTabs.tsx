import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const safeAreaInsets = useSafeAreaInsets();
  const telegramViewport = useAppStore((state) => state.telegramSession.viewport);
  const bottomInset = Math.max(
    safeAreaInsets.bottom,
    telegramViewport.contentSafeAreaBottom,
    telegramViewport.safeAreaBottom,
    8,
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: appTheme.colors.background,
        },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: appTheme.colors.surface,
          borderTopColor: appTheme.colors.border,
          height: 60 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: appTheme.colors.accent,
        tabBarInactiveTintColor: appTheme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Workouts"
        getComponent={() => require("@/features/workouts/WorkoutsScreen").WorkoutsScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Тренировки</Text> }}
      />
      <Tab.Screen
        name="Activity"
        getComponent={() => require("@/features/activity/ActivityScreen").ActivityScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Активность</Text> }}
      />
      <Tab.Screen
        name="Nutrition"
        getComponent={() => require("@/features/nutrition/NutritionScreen").NutritionScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Питание</Text> }}
      />
      <Tab.Screen
        name="History"
        getComponent={() => require("@/features/history/HistoryScreen").HistoryScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>История</Text> }}
      />
    </Tab.Navigator>
  );
}
