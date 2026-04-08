import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  stickyFooter?: ReactNode;
}>;

export function Screen({ children, contentContainerStyle, stickyFooter }: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const telegramViewport = useAppStore((state) => state.telegramSession.viewport);

  const topInset = Math.max(telegramViewport.contentSafeAreaTop, telegramViewport.safeAreaTop);
  const bottomInset = Math.max(
    safeAreaInsets.bottom,
    telegramViewport.contentSafeAreaBottom,
    telegramViewport.safeAreaBottom,
  );
  const contentBottomPadding = (stickyFooter ? 148 : appTheme.spacing.xxl) + bottomInset;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: appTheme.spacing.md + topInset,
            paddingBottom: contentBottomPadding,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>{children}</View>
      </ScrollView>
      {stickyFooter ? <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 12) }]}>{stickyFooter}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  content: {
    paddingHorizontal: appTheme.spacing.lg,
    gap: appTheme.spacing.lg,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
