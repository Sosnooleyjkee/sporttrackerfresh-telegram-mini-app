import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAppStore } from "@/store/useAppStore";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const isCompleted = useAppStore((state) => state.questionnaire.isCompleted);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isCompleted ? (
        <Stack.Screen name="Onboarding" getComponent={() => require("@/features/onboarding/OnboardingScreen").OnboardingScreen} />
      ) : (
        <Stack.Screen name="MainTabs" getComponent={() => require("@/navigation/MainTabs").MainTabs} />
      )}
    </Stack.Navigator>
  );
}
