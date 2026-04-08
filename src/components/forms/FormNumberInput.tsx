import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { appTheme } from "@/theme/appTheme";

type FormNumberInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
};

export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: FormNumberInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            keyboardType="numeric"
            value={String(value ?? "")}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={appTheme.colors.textMuted}
            style={[styles.input, error ? styles.errorInput : null]}
          />
          {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceRaised,
    color: appTheme.colors.textPrimary,
    paddingHorizontal: appTheme.spacing.md,
    fontSize: 15,
  },
  errorInput: {
    borderColor: appTheme.colors.danger,
  },
  errorText: {
    color: appTheme.colors.danger,
    fontSize: 12,
  },
});
