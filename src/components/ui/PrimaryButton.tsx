import { Pressable, StyleSheet, Text } from "react-native";

import { appTheme } from "@/theme/appTheme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: appTheme.radius.pill,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: appTheme.spacing.lg,
  },
  primary: {
    backgroundColor: appTheme.colors.accent,
  },
  secondary: {
    backgroundColor: appTheme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryLabel: {
    color: appTheme.colors.textInverse,
  },
  secondaryLabel: {
    color: appTheme.colors.textPrimary,
  },
});
